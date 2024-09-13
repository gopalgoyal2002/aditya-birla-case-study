import React, { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";

import MenuItem from "@mui/material/MenuItem";
import { useNavigate } from "react-router-dom";
import Button from "@mui/joy/Button";
import "./header.css";

const pages = ["Expense", "Document Management"];

const Header = ({ style, logoFlag }) => {
  const navigate = useNavigate();
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [loginStatus, setLoginStatus] = useState(false);
  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
    console.log(event.currentTarget);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setLoginStatus(false);
    navigate("/login");
  };

  const handleCloseNavMenu = (page) => {
    navigate("/" + page);
    setAnchorElNav(null);
  };

  return (
    <AppBar position="static" style={style}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          ></Typography>

          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
              style={{ color: "black" }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={() => handleCloseNavMenu("")}
              sx={{
                display: { xs: "block", md: "none" },
              }}
            >
              {pages.map((page) => (
                <MenuItem key={page} onClick={() => handleCloseNavMenu(page)}>
                  <Typography textAlign="center">{page}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "black",
              textDecoration: "none",
            }}
          ></Typography>
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            <Button
              variant="plain"
              key="Document Management"
              style={{
                background:
                  window.location.pathname == "/Document-Management"
                    ? "lightblue"
                    : "",
                margin: "0 5px",
              }}
              onClick={() => handleCloseNavMenu("Document-Management")}
            >
              Document Management
            </Button>
            <Button
              variant="plain"
              key="Document Retrieval"
              style={{
                background:
                  window.location.pathname == "/Document-Retrieval"
                    ? "lightblue"
                    : "",
                margin: "0 5px",
              }}
              onClick={() => handleCloseNavMenu("Document-Retrieval")}
            >
              Document Retrieval
            </Button>
            <Button
              variant="plain"
              key="Chat Bot"
              style={{
                background:
                  window.location.pathname == "/Chat-Bot" ? "lightblue" : "",
                margin: "0 5px",
              }}
              onClick={() => handleCloseNavMenu("Chat-Bot")}
            >
              Chat Bot
            </Button>
          </Box>

          <div>
            <Button
              key="Log Out"
              onClick={() => handleLogout()}
              style={{ marginRight: "5px", background: "#AB6993" }}
            >
              Log Out
            </Button>
          </div>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
