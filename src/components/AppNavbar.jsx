import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import { authService } from "../services/api";

export default function AppNavbar() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" fixed="top">
      <Container>
        <Navbar.Brand as={NavLink} to="/">
          Twitter
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto d-flex flex-row">
            <NavLink to="/home" className="nav-link px-3 text-light">
              Home
            </NavLink>

            {username ? (
              <>
                <NavLink
                  to={`/user/${username}`}
                  className="nav-link px-3 text-light"
                >
                  {username}
                </NavLink>
                <Nav.Link
                  onClick={handleLogout}
                  className="nav-link px-3 text-light"
                >
                  Sign Out
                </Nav.Link>
              </>
            ) : (
              <>
                <NavLink to="/login" className="nav-link px-3 text-light">
                  Login
                </NavLink>
                <NavLink to="/register" className="nav-link px-3 text-light">
                  Register
                </NavLink>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
