# Pitch Pal API Reference

This document provides a concise reference for all main API endpoints in the Pitch Pal application, including routes, methods, authentication, parameters, and example responses. Use this as a quick lookup for backend/frontend integration and debugging.

---

## Table of Contents
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
    - [/api/chat](#apichat)
    - [/api/vote](#apivote)
    - [/api/history](#apihistory)
    - [/api/document](#apidocument)
    - [Other Endpoints](#other-endpoints)
- [Error Handling](#error-handling)
- [Conventions](#conventions)

---

## Authentication
- **Required:** All sensitive endpoints require a Supabase JWT in the `Authorization: Bearer <token>` header.
- **How:** Use `fetchWithSupabaseAuth` on the frontend to ensure the token is attached.
- **RLS:** Row Level Security is enforced on all user data tables.

---

## API Endpoints

### `/api/chat`
- **POST**: Send a chat message and receive a streamed response.
    - **Headers:** `Authorization: Bearer <supabase_jwt>`
    - **Body:**
      ```json
      {
        "id": "<chat_id>",
        "messages": [ ... ],
        "selectedChatModel": "grok-2"
      }
      ```
    - **Response:**
      - `200 OK`: Streamed chat response
      - `401 Unauthorized`: Missing/invalid JWT
      - `500 Internal Server Error`: LLM or pipeline failure

---

### `/api/vote`
- **GET**: Fetch vote(s) for a chat/message
    - **Query:** `?chatId=<id>`
    - **Headers:** `Authorization: Bearer <supabase_jwt>`
    - **Response:**
      - `200 OK`: `{ votes: [...] }`
      - `404 Not Found`: No vote found for chat/message
- **POST**: Submit or update a vote
    - **Body:**
      ```json
      {
        "chatId": "<id>",
        "messageId": "<id>",
        "isUpvoted": true
      }
      ```
    - **Response:**
      - `200 OK`: `{ success: true }`
      - `400 Bad Request`: Invalid payload
      - `401 Unauthorized`: Missing/invalid JWT

---

### `/api/history`
- **GET**: Fetch chat history for the authenticated user
    - **Headers:** `Authorization: Bearer <supabase_jwt>`
    - **Response:**
      - `200 OK`: `{ chats: [...] }`
      - `406 Not Acceptable`: No chat history (returns empty array)

---

### `/api/document`
- **GET**: Fetch knowledge base documents
    - **Query:** `?id=<document_id>`
    - **Headers:** `Authorization: Bearer <supabase_jwt>`
    - **Response:**
      - `200 OK`: `{ documents: [...] }`
      - `404 Not Found`: No document found

---

### Other Endpoints
- `/api/list-users` (admin): List all users
- `/api/admin/knowledge-base`: Manage RAG chunks/files
- `/api/admin/settings`: Update chatbot personality, model, costs
- `/api/admin/training`: Manage corrections/training data

---

## Error Handling
- **401 Unauthorized:** Missing or invalid JWT (ensure frontend uses `fetchWithSupabaseAuth`)
- **404 Not Found:** Resource does not exist or user lacks access
- **406 Not Acceptable:** (e.g., empty chat history)
- **500 Internal Server Error:** Backend or LLM pipeline failure

---

## Conventions
- All endpoints return JSON unless streaming (chat)
- All endpoints require authentication unless explicitly public
- Use `id` fields as UUIDs throughout
- Admin endpoints are gated by `user_roles` and middleware

---

_Last updated: 2025-04-25_

> **Note:** Update this document whenever you add, remove, or change API endpoints or their behavior.
