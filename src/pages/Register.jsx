import { Form, Button, Container, Row, Col, Card } from "react-bootstrap";
import React, { useState } from "react";
import { authService } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authService.register(username, password);
      const loginResponse = await authService.login(username, password);
      if (loginResponse) {
        navigate("/home");
      }
    } catch (error) {
      setMessage(error.message || "Registration failed");
    }
  };

  return (
    <Container className="mt-5 pt-5">
      <Row className="justify-content-md-center">
        <Col md={6} lg={5}>
          <Card className="shadow-sm">
            <Card.Body>
              <h1 className="text-center mb-4 text-primary">Register</h1>
              {message && (
                <div className="alert alert-danger" role="alert">
                  {message}
                </div>
              )}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formUsername">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="formPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100">
                  Register
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
