# REST API Documentation

## User Service

Base URL:

http://localhost:3001

---

### Health Check

GET /health

Response:

{
  "status": "User Service is running"
}

---

### Register User

POST /users/register

Request:

{
  "username": "rakan",
  "email": "rakan@example.com",
  "password": "123456"
}

Response:

{
  "id": 1,
  "username": "rakan",
  "email": "rakan@example.com",
  "created_at": "2026-05-02T..."
}

---

### Login User

POST /users/login

Request:

{
  "email": "rakan@example.com",
  "password": "123456"
}

Response:

{
  "token": "jwt_token_here"
}

---

### Get User

GET /users/{id}

---

## Message Service

Base URL:

http://localhost:3002

---

### Health Check

GET /health

Response:

{
  "status": "Message Service is running"
}

---

### Send Message

POST /messages

Request:

{
  "sender_id": 1,
  "receiver_id": 2,
  "content": "Hello"
}

Response:

{
  "id": 1,
  "sender_id": 1,
  "receiver_id": 2,
  "content": "Hello",
  "created_at": "2026-05-02T..."
}

---

### Get Conversation

GET /messages/{user1}/{user2}

Response:

[
  {
    "id": 1,
    "sender_id": 1,
    "receiver_id": 2,
    "content": "Hello",
    "created_at": "2026-05-02T..."
  }
]