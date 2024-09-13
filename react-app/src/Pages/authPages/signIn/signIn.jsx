import React, { useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import "./signin.css";
import TextField from "@mui/material/TextField";
import { login } from "../../../apiHelper/auth";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import LinearProgress from "@mui/material/LinearProgress";
import { useNavigate } from "react-router-dom";

export default function SignIn() {
  const [userName, setUserName] = useState("");
  const [password, setPassoword] = useState("");
  const [loding, setLoding] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [error, setError] = useState(false);
  const [msg, setMsg] = useState("");
  const [loadWhole, setLoadWhole] = useState(false);
  const navigate = useNavigate();
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoding(true);
    login({ username: userName, password })
      .then((res) => {
        if (res.access_token) {
          localStorage.setItem("access_token", JSON.stringify(res));
          console.log(res);
          setOpen(true);
          setMsg(res.message);
          setError(true);
          setLoding(false);
          navigate("/Document-Management");
        } else {
          setOpen(true);
          setError(false);
          setMsg(res.message);
          setLoding(false);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div>
      {loadWhole === true && (
        <div
          style={{
            display: "flex",
            alignContent: "center",
            justifyContent: "center",
            marginTop: "40vh",
          }}
        >
          <CircularProgress />
        </div>
      )}
      {loadWhole === false && (
        <div>
          <div className="auth-pages-div">
            <div className="auth-pages">
              <div className="auth-pages-title">
                <h1>Login</h1>
              </div>

              <form>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <TextField
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    id="outlined-basic"
                    label="user name"
                    variant="outlined"
                    style={{ marginBottom: "20px" }}
                  />
                  <TextField
                    value={password}
                    onChange={(e) => setPassoword(e.target.value)}
                    id="outlined-password-input"
                    label="password"
                    type="password"
                    autoComplete="current-password"
                  />
                  <button
                    className="auth-botton"
                    onClick={handleSubmit}
                    disabled={loding}
                    style={{ background: loding === true ? "gray" : "" }}
                  >
                    Login
                  </button>
                  <>{loding === true && <LinearProgress />}</>
                </div>
              </form>
              <Snackbar
                open={open}
                autoHideDuration={6000}
                onClose={handleClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
              >
                <Alert
                  onClose={handleClose}
                  severity={error === true ? "success" : "error"}
                  variant="filled"
                  sx={{ width: "100%" }}
                >
                  {msg}
                </Alert>
              </Snackbar>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
