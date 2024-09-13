import React, { useState } from "react";
import Header from "../../Components/header/header";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import { search } from "../../apiHelper/search";
import { useNavigate } from "react-router-dom";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
export default function SearchBot() {
  const headerStyle = {
    backgroundColor: "white",
  };
  const [query, setQuery] = useState("");
  const [loader, setLoader] = useState(false);
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const handleSearchQuery = async () => {
    setLoader(true);
    const token = JSON.parse(localStorage.getItem("access_token"));
    if (token && token["access_token"]) {
      const res = await search(token["access_token"], query, 5);
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
              style={{ height: "150px", margin: "0" }}
            />
            <Skeleton
              animation="wave"
              style={{ height: "150px", margin: "0" }}
            />
            <Skeleton
              animation="wave"
              style={{ height: "150px", margin: "0" }}
            />
          </Box>
        </>
      )}
      {loader == false && (
        <div style={{ margin: "20px" }}>
          {data["documents"] &&
            data["documents"].length > 0 &&
            data["documents"].map((doc, index) => (
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1-content"
                  id="panel1-header"
                >
                  <span>Page no. {doc["page_no"] + 1}</span>
                  <span>
                    &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                    &nbsp; &nbsp; &nbsp; &nbsp; {doc["doc_name"]}
                  </span>
                </AccordionSummary>
                <AccordionDetails>{doc["text"]
                  .split("\n")
                  .map((line, i) =>
                    line ? <p key={i}>{line}</p> : <br key={i} />
                  )}</AccordionDetails>
              </Accordion>
            ))}
        </div>
      )}
    </div>
  );
}
