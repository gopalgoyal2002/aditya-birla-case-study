import React from "react";
import Header from "../../Components/header/header";
import {
  initiateUpload,
  completeUpload,
  uploadApi,
  getAllDocuments,
  deleteDocuments,
  downlaodDocument,
} from "../../apiHelper/docManamgement";
import { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { LinearProgress, CircularProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {  useNavigate } from "react-router-dom";
import { Tooltip } from "@mui/material";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import Snackbar from "@mui/material/Snackbar";
import ReplayIcon from "@mui/icons-material/Replay";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  //   border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function DocManagement() {
  const [allDocs, setAllDocs] = useState([]);
  const [openUploadModal, setOpenUplaodModal] = useState(false);
  
  const [uploadFiles, setUploadFiles] = useState([]);
  const [fileCount, setFileCount] = useState(0);
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loader, setLoader] = useState(false);
  const navigate = useNavigate();

  const handleModalOpen = () => setOpenUplaodModal(true);
  const handleModalClose = () =>{ setOpenUplaodModal(false)
                        setUploadFiles([])
  };
  const headerStyle = {
    backgroundColor: "white",
  };
  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };
  const handleGetAllDocs = async () => {
    setLoader(true);
    const token = JSON.parse(localStorage.getItem("access_token"))[
      "access_token"
    ];
    if (!token) {
      navigate("/login");
      return;
    }
    const res = await getAllDocuments(token);
    if (res.status == 200) {
      setAllDocs(res.data);
    } else {
      navigate("/login");
    }
    setLoader(false);
  };
  const handleDelete = async (file_name) => {
    setLoader(true);
    const token = JSON.parse(localStorage.getItem("access_token"))[
      "access_token"
    ];
    if (!token) {
      navigate("/login");
      return;
    }

    const res = await deleteDocuments(token, file_name);
    if (res.status == 200) {
      setErrorMsg(res.message);
      setSnackBarOpen(true);
      handleGetAllDocs();
    } else {
      // setErrorMsg(res.message)
      setSnackBarOpen(true);
      handleGetAllDocs();
    }
    setLoader(false);
  };
  const handleDownload = async (file_name) => {
    setLoader(true);
    const token = JSON.parse(localStorage.getItem("access_token"))[
      "access_token"
    ];
    if (!token) {
      navigate("/login");
      return;
    }

    const res = await downlaodDocument(token, file_name);
    if (res.status == 200) {
      setErrorMsg(res.message);
      setSnackBarOpen(true);
      window.open(res.data.url, "_blank");
    } else {
      setErrorMsg(res.message);
      setSnackBarOpen(true);
    }
    setLoader(false);
  };
  function getFileType(fileName) {
    const extension = fileName.split(".").pop().toLowerCase();
    if (extension === "pdf") {
      return "pdf";
    } else {
      return "other";
    }
  }

  const handleFileChange = async (event) => {
    if (fileCount <= 100) {
      const uploadedFiles = Array.from(event.target.files);
      setFileCount(fileCount + uploadedFiles.length);
      const newFiles = uploadedFiles.map((file) => ({
        doc_type: getFileType(file.name),
        doc_name: file.name,
        doc_size: file.size.toString(),
        uploadstatus: "new", // Initially set upload status to 'loading'
        percentage: "0", // Initial value for percentage
        message: "",
      }));

      setUploadFiles((prevFiles) => [...prevFiles, ...newFiles]);

      await Promise.all(
        uploadedFiles.map(async (file) => {
          const fileType = getFileType(file.name);

          // Make a request to your backend to get the presigned URL for S3 upload
          const userData = await localStorage.getItem("access_token");
          const userDataObj = JSON.parse(userData);
          if (!userDataObj || !userDataObj["access_token"]) {
            setErrorMsg(
              "User token not found in AsyncStorage. Please login again"
            );
            setSnackBarOpen(true);
            console.error(
              "User token not found in AsyncStorage. Please login again"
            );
            return;
          }
          const userToken = userDataObj["access_token"];

          // get presigned url
          const presignedUrlData = await initiateUpload(userToken, [file.name]);
          if (!presignedUrlData.data[0].url) {
            return {
              doc_type: fileType,
              doc_name: file.name,
              doc_size: file.size.toString(),
              uploadstatus: "failed", // Update upload status to 'error'
              percentage: "0", // Initial value for percentage
              message: presignedUrlData.data[0].message,
            };
          }
          // Upload the file to S3 using the presigned URL
          const docPath = presignedUrlData.data[0].path;
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", presignedUrlData.data[0].url);
          xhr.upload.onprogress = (event) => {
            const percentage = (event.loaded / event.total) * 100;
            // Update the percentage and upload status for this file
            setUploadFiles((prevFiles) => {
              const updatedFiles = prevFiles.map((prevFile) => {
                if (prevFile.doc_name === file.name) {
                  return {
                    ...prevFile,
                    percentage: percentage.toFixed(2),
                    uploadstatus:
                      percentage === 100 ? "complete" : "processing",
                    doc_path: docPath,
                  };
                }
                return prevFile;
              });
              return updatedFiles;
            });
          };
          xhr.send(file);
        })
      );
    }
  };
  const handleProcessDocuments = async () => {
    setLoader(true);
    const token = JSON.parse(localStorage.getItem("access_token"))[
      "access_token"
    ];
    if (!token) {
      navigate("/login");
      return;
    }
    if (uploadFiles.length <= 0) {
      setErrorMsg("Please uplaod documents");
      setSnackBarOpen(true);
      return;
    }
    const list = uploadFiles.map((data) => {
      if (data.uploadstatus == "complete") {
        return data.doc_name;
      }
    });
    const res = await completeUpload(token, list);
    if (res.status == 200) {
      setErrorMsg(res.message);
      setSnackBarOpen(true);
      setUploadFiles([])
      handleGetAllDocs();
    }
    handleModalClose();
    setLoader(false);
  };
  useEffect(() => {
    handleGetAllDocs();
  }, []);

  return (
    <div>
      <Header style={headerStyle} logoFlag={false} />
      <div style={{ margin: "20px", display: "flex", flexDirection: "column" }}>
        <div>
          <span style={{ fontSize: "20px" }}>Document Management</span>
          <Button
            onClick={handleModalOpen}
            variant="contained"
            style={{ float: "right" }}
          >
            Upload files
          </Button>
          <IconButton
            aria-label="delete"
            size="large"
            style={{ float: "right", marginRight: "10px" }}
            onClick={handleGetAllDocs}
          >
            <ReplayIcon fontSize="small" />
          </IconButton>
        </div>
      </div>
      <>
        {loader == false && (
          <TableContainer component={Paper} style={{ padding: "20px" }}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead sx={{ background: "lightgray" }}>
                <TableRow>
                  <TableCell align="center">File Name</TableCell>
                  <TableCell align="center">Uploaded At</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allDocs.map((row) => (
                  <TableRow
                    key={row.name}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell align="center">{row.doc_name}</TableCell>
                    <TableCell align="center">{row.uploaded_at}</TableCell>
                    <TableCell
                      align="center"
                      style={{
                        color: row.status == "processed" ? "green" : "",
                      }}
                    >
                      {row.status}
                    </TableCell>
                    <TableCell align="center">
                      {row.status=="processed" &&
                      <IconButton
                        aria-label="delete"
                        onClick={() => {
                          handleDelete(row.doc_name);
                        }}
                      >
                        
                        <DeleteIcon />
                      </IconButton>
                      }
                      <IconButton
                        aria-label="delete"
                        onClick={() => {
                          handleDownload(row.doc_name);
                        }}
                      >
                        <FileDownloadIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </>
      {loader && (
        <div style={{ margin: "20px" }}>
          <Skeleton animation="wave" style={{ height: "100px" }} />
          <Skeleton animation="wave" style={{ height: "100px" }} />
          <Skeleton animation="wave" style={{ height: "100px" }} />
        </div>
      )}

      <Modal
        open={openUploadModal}
        onClose={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Box
            style={{
              border: "2px dashed #ccc",
              borderRadius: "10px",
              padding: "20px",
              marginBottom: "20px",
              marginTop: "20px",
              textAlign: "center",
              backgroundColor: "white",
              position: "sticky",
              top: "0",
              overflow: "hidden",
              display: "block",
              justifyContent: "center",
            }}
          >
            <Box>
              <Tooltip title="Upload invoice">
                <label htmlFor="contained-button-file">
                  <UploadFileOutlinedIcon
                    sx={{ cursor: "pointer", color: "#2196F3" }}
                  />
                </label>
              </Tooltip>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Typography
                sx={{
                  cursor: "pointer",
                  color: "#2196F3",
                  textDecoration: "underline",
                  fontSize: "16px",
                  marginRight: "5px",
                  textAlign: "center",
                }}
              >
                <label
                  htmlFor="contained-button-file"
                  style={{ cursor: "pointer" }}
                >
                  Click to upload
                </label>
              </Typography>
              <Typography sx={{ color: "#000000DE", fontSize: "16px" }}>
                or drag and drop
              </Typography>
            </Box>
            <Box>
              <Typography
                sx={{ color: "#00000099", fontSize: "13px", marginTop: "5px" }}
              >
                .pdf file or Upload it from your Computer
              </Typography>
              <Typography
                sx={{ color: "#00000099", fontSize: "13px", marginTop: "5px" }}
              >
                Maximum File Size: 100 MB <br/>
                Please don't uplaod duplicate documents*
              </Typography>
            </Box>
            <input
              accept=".pdf"
              id="contained-button-file"
              multiple
              type="file"
              onChange={handleFileChange}
              style={{ display: "none" }} // Hide the input field
            />
          </Box>
          {uploadFiles.map((file, index) => (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                margin: "17px",
              }}
            >
              <Box sx={{ display: "flex" }}>
                <Box>
                  {" "}
                  <UploadFileOutlinedIcon
                    sx={{ margin: "16px", color: "#2196F3" }}
                  />
                </Box>
                <Box>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "16px",
                        color: "#000000DE",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "250px",
                      }}
                    >
                      {file.doc_name}
                    </Typography>{" "}
                  </Box>
                  <Box sx={{ display: "flex", marginBottom: "5px" }}>
                    <Box>
                      <Typography sx={{ fontSize: "12px", color: "#00000099" }}>
                        {formatBytes(file.doc_size)}
                      </Typography>{" "}
                    </Box>
                    <Box>
                      <Typography
                        sx={{
                          fontSize: "12px",
                          color: "#00000099",
                          marginLeft: "15px",
                        }}
                      >
                        {file.percentage < 100 ? "loading..." : "Completed"}
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <LinearProgress
                      variant="determinate"
                      value={file.percentage}
                      sx={{ width: "300px" }}
                    />
                  </Box>
                </Box>
              </Box>
              <Box sx={{ marginTop: "15px" }}>
                <IconButton
                  onClick={() => {
                    setUploadFiles((prevFiles) =>
                      prevFiles.filter(
                        (file) => file.doc_name !== file.doc_name
                      )
                    );
                  }}
                >
                  {file.percentage == 100 && (
                    <CloseIcon sx={{ color: "#0000008F" }} />
                  )}
                </IconButton>{" "}
              </Box>
            </Box>
          ))}
          <Box sx={{ display: "flex", margin: "15px", float: "right" }}>
            <Box sx={{}}>
              <Button
                sx={{ fontWeight: "bold" }}
                variant="outlined"
                onClick={handleModalClose}
              >
                Cancel
              </Button>
            </Box>
            <Box sx={{}}>
              <Button
                onClick={handleProcessDocuments}
                sx={{
                  fontWeight: "bold",
                  color: "white",
                  backgroundColor: "#2196F3",
                  marginLeft: "15px",
                  "&:hover": {
                    backgroundColor: "#2196F3", // Set the hover color
                  },
                }}
                backgroundColor="#616161"
              >
                Process
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={snackBarOpen}
        onClose={() => {
          setSnackBarOpen(false);
        }}
        message={errorMsg}
      />
    </div>
  );
}
