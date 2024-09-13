import React, { useState } from "react";
import Header from "../../Components/header/header";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import { generativeSearch } from "../../apiHelper/search";
import { useNavigate } from "react-router-dom";
import { downlaodDocument } from "../../apiHelper/docManamgement";
export default function ChatBot() {
  const headerStyle = {
    backgroundColor: "white",
  };
  const [query, setQuery] = useState("");
  const [loader, setLoader] = useState(false);
  const [data, setData] = useState("");
  const navigate = useNavigate();
  const handleSearchQuery = async () => {
    setLoader(true);
    const token = JSON.parse(localStorage.getItem("access_token"));
    if (token && token["access_token"]) {
      const res = await generativeSearch(token["access_token"], query);
      if (res.status == 200) {
        setData(res.data);
      } else {
        console.log(res);
      }
    } else {
      navigate("/login");
    }
    setLoader(false);
  };
  const handleDownload = async (file_name) => {
    const token = JSON.parse(localStorage.getItem("access_token"))[
      "access_token"
    ];
    if (!token) {
      navigate("/login");
      return;
    }

    const res = await downlaodDocument(token, file_name);
    if (res.status == 200) {
      window.open(res.data.url, "_blank");
    } else {
      console.log("ERROR OCCURE");
    }
  };
  return (
    <div>
      <Header style={headerStyle} logoFlag={false} />
      <div style={{ display: "flex", flexDirection: "row", margin: "20px" }}>
        <Box sx={{ width: "100vw", maxWidth: "100%" }}>
          <TextField
            fullWidth
            label="Enter Query"
            id="fullWidth"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
          />
        </Box>
        <Button
          variant="contained"
          style={{ marginLeft: "20px", width: "150px" }}
          onClick={handleSearchQuery}
        >
          Submit
        </Button>
      </div>
      {loader == true && (
        <>
          <Box style={{ margin: "20px" }}>
            <Skeleton
              animation="wave"
              style={{ height: "250px", margin: "0" }}
            />
          </Box>
        </>
      )}
      {data && loader == false && (
        <>
          <div style={{ margin: "20px" }}>
            <h3>Answer: </h3>
            {data["answer"] &&
              data["answer"]
                .split("\n")
                .map((line, i) =>
                  line ? <p key={i}>{line}</p> : <br key={i} />
                )}
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", margin: "20px" }}
          >
            <hr />
            <div>
              <span style={{ fontSize: "20px" }}>Document Name: </span>
              <span
                style={{
                  textDecoration: "underline",
                  color: "blue",
                  cursor: "pointer",
                }}
                onClick={() => {
                  handleDownload(data["doc_name"]);
                }}
              >
                {data["doc_name"]}
              </span>
            </div>
            <div>
              <span style={{ fontSize: "20px" }}>
                Page no: {data["page_no"] + 1}{" "}
              </span>
            </div>

            <div>
              <span style={{ fontSize: "20px" }}>Context:</span>{" "}
              {data["context"] &&
                data["context"]
                  .split("\n")
                  .map((line, i) =>
                    line ? <p key={i}>{line}</p> : <br key={i} />
                  )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}