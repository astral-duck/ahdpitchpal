# Pitch Pal Application Index

This document provides a high-level index and map of the Pitch Pal codebase, including directory structure, key files, database tables, and API endpoints. It is intended as a quick reference for developers and stakeholders.

---

## 1. Directory Structure

- `/app` – Next.js application routes (API, pages, admin dashboard)
    - `/api` – Serverless API endpoints (chat, vote, history, etc)
    - `/admin` – Admin dashboard (users, knowledge base, feedback, settings)
    - `/chat` – Chat UI and logic
- `/components` – React UI components (chat, sidebar, document preview, etc)
- `/lib` – Library code (Supabase auth, AI helpers, utility functions)
- `/context` – React context providers (user roles, authentication)
- `/documentation` – Project documentation (this file, database, PRD, tasks)
- `/knowledge` – Knowledge base assets (now stored and indexed in Ducky.ai)

---

## 2. Database Tables (Postgres via Supabase)

- `chats` – Chat sessions (id, user_id, created_at, ...)
- `messages` – Chat messages (id, chat_id, user_id, content, ...)
- `chatbot_settings` – Personality/instructions, model selection, costs
- `rag_chunks` – Knowledge base chunks for RAG (now managed by Ducky.ai, not Supabase)
- `user_roles` – User roles (user_id, role)
- `profiles` – User profile info (user_id, first_name, last_name, ...)
- `feedback` – User feedback on responses

---

## 3. Main API Endpoints

- `/api/chat` (POST): Chatbot interaction (requires Supabase JWT)
- `/api/vote` (GET/POST): Voting on chat responses
- `/api/history` (GET): Fetch chat history
- `/api/document` (GET): Fetch knowledge base documents

---

## 4. Key Flows

- **Chat Flow:**
    1. User sends message via chat UI
    2. Frontend calls `/api/chat` with Supabase JWT
    3. Backend verifies auth, fetches settings, RAG, personality, calls LLM, streams response
    4. Messages and votes saved to DB

- **RAG Flow:**
    1. Knowledge base files uploaded via admin dashboard
    2. Files are uploaded directly to Ducky.ai, which handles chunking, embedding, and retrieval (no longer stored in Vercel Blob or chunked in Supabase)
    3. Retrieval and context injection for chatbot answers is handled via Ducky.ai API

- **Voting Flow:**
    1. User votes on a response
    2. Frontend calls `/api/vote` (GET to fetch, POST to submit)
    3. Backend verifies auth, updates/returns vote in DB

---

## 5. Integration & Security

- **Authentication:** All sensitive API endpoints require Supabase JWT (via `fetchWithSupabaseAuth`)
- **Row Level Security:** Enforced on all user data tables
- **Admin:** Admin dashboard gated by `user_roles` and middleware

---

## 6. References

- [database-architecture.md](./database-architecture.md) – Full DB schema
- [prd.md](./prd.md) – Product requirements
- [tasks/steps.md](./tasks/steps.md) – Task breakdown and progress

---

_Last updated: 2025-04-25_

> **Note:** Update this index whenever you add/remove major features, endpoints, or tables.
