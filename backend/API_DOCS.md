# Arogya Hospital - Backend API Documentation

This document provides details on the available API endpoints for the Arogya Hospital backend service.

## Base URL

`http://localhost:5000/api`

---

## Authentication Endpoints

Authentication is handled via JWT (JSON Web Tokens). The following endpoints are available for user registration and login.

### 1. User Registration

- **Endpoint:** `/auth/register`
- **Method:** `POST`
- **Description:** Registers a new user in the system.
- **Content-Type:** `application/json`

#### Request Body

```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "role": "patient"
}
```

- `username` (String, required): A unique username.
- `email` (String, required): A unique email address.
- `password` (String, required): User's password (will be hashed).
- `role` (String, optional): User's role (e.g., 'patient', 'doctor'). Defaults to 'patient' if not provided.

#### Responses

- **Success (201 Created)**

  ```json
  {
    "message": "User registered successfully"
  }
  ```

- **Error (400 Bad Request)** - If email or username already exists.

  ```json
  {
    "error": "Email or username already in use"
  }
  ```

- **Error (500 Internal Server Error)** - For any other server-side errors.

  ```json
  {
    "error": "Server error message"
  }
  ```

### 2. User Login

- **Endpoint:** `/auth/login`
- **Method:** `POST`
- **Description:** Authenticates a user and returns a JWT.
- **Content-Type:** `application/json`

#### Request Body

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

- `email` (String, required): The user's registered email.
- `password` (String, required): The user's password.

#### Responses

- **Success (200 OK)**

  ```json
  {
    "token": "<your_jwt_token_here>"
  }
  ```

- **Error (401 Unauthorized)** - If credentials are invalid.

  ```json
  {
    "error": "Invalid credentials"
  }
  ```

- **Error (500 Internal Server Error)**

  ```json
  {
    "error": "Server error message"
  }
  ```

---

## Protected Routes

To access protected routes, include the JWT in the `Authorization` header.

- **Header:** `Authorization`
- **Value:** `Bearer <your_jwt_token_here>`
