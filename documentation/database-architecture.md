# Pitch Pal Master Database Architecture

## Table Overview

| Table             | Purpose / Description                                                                                         |
|-------------------|-------------------------------------------------------------------------------------------------------------|
| `admin_users`     | Tracks users with admin privileges.                                                                          |
| `chatbot_settings`| Stores global chatbot settings (instructions, model, token costs, etc).                                      |
| `chats`           | Stores chat sessions per user.                                                                               |
| `feedback`        | Stores user/admin feedback and flagging on individual messages.                                              |
| `messages`        | Stores all messages (user and bot) for each chat.                                                            |
| `profiles`        | Stores user profile info (first/last name, etc).                                                             |
| ~~`rag_chunks`~~  | ~~Stores vectorized knowledge base chunks for RAG retrieval.~~ (Deprecated: now handled by Ducky.ai)         |
| `user_roles`      | Maps users to roles (admin, user, etc).                                                                      |

---

## Schema Details

### `admin_users`
- `user_id` (PK, UUID): References `auth.users(id)`

### `chatbot_settings`
- `id` (PK, INT, default 1)
- `instructions` (TEXT)
- `updated_at` (TIMESTAMPTZ, default now())
- `model` (TEXT)
- `token_cost_in` (NUMERIC)
- `token_cost_out` (NUMERIC)

### `chats`
- `id` (PK, UUID, default gen_random_uuid())
- `user_id` (UUID, FK → `auth.users(id)`)
- `title` (TEXT)
- `created_at` (TIMESTAMP, default now())

### `feedback`
- `id` (PK, UUID, default gen_random_uuid())
- `user_id` (UUID, FK → `auth.users(id)`)
- `chat_id` (UUID, FK → `chats(id)`)
- `message_id` (UUID, FK → `messages(id)`)
- `feedback` (TEXT)
- `type` (TEXT)
- `created_at` (TIMESTAMP, default now())

### `messages`
- `id` (PK, UUID, default gen_random_uuid())
- `chat_id` (UUID, FK → `chats(id)`)
- `user_id` (UUID, FK → `auth.users(id)`)
- `content` (TEXT)
- `role` (TEXT)
- `created_at` (TIMESTAMP, default now())

### `profiles`
- `user_id` (PK, UUID, FK → `auth.users(id)` ON DELETE CASCADE)
- `first_name` (TEXT)
- `last_name` (TEXT)
- `created_at` (TIMESTAMPTZ, default timezone('utc', now()))

### `user_roles`
- `id` (PK, UUID, default uuid_generate_v4())
- `user_id` (UUID, FK → `auth.users(id)` ON DELETE CASCADE)
- `role` (TEXT)
- **Unique Index:** (`user_id`, `role`)

---

## Knowledge Base & RAG

> **Note:** As of April 2025, all knowledge base chunking, embedding, and retrieval is managed by Ducky.ai. The `rag_chunks` table is deprecated and no longer used for chatbot context retrieval. All document uploads are indexed and retrieved via Ducky.ai's managed API.

---

## Relationships

- **User ↔ Chats:**  One user can have many chats (`chats.user_id` → `auth.users.id`).
- **Chat ↔ Messages:**  One chat has many messages (`messages.chat_id` → `chats.id`).
- **User ↔ Messages:**  Each message has an author (`messages.user_id` → `auth.users.id`).
- **Chat/Message ↔ Feedback:**  Feedback is linked to both a chat and a specific message.
- **User ↔ Profile:**  Each user has one profile (`profiles.user_id` → `auth.users.id`).
- **User ↔ User Roles:**  Each user can have multiple roles (admin, user, etc).

---

## Indexes
- `idx_feedback_chat_id` on `feedback(chat_id)`
- `idx_messages_chat_id` on `messages(chat_id)`
- Unique index on `user_roles(user_id, role)`

---

## RLS Policy Notes
- **chats/messages/feedback:**  
  - Admins can access all rows.
  - Users can only access/manage their own rows.
- **chatbot_settings:**  
  - Only admins can read/write.
- **profiles:**  
  - Users can only access/update their own profile.
- **user_roles:**  
  - Admins can view all; users can view their own.

---

## Usage Patterns
- **Chat history:**  
  - `chats` table drives the left sidebar for chat selection.
  - `messages` table contains the full conversation for each chat.
- **Feedback/Flagging:**  
  - `feedback` table records user/admin feedback on chatbot responses.
- **Roles/Admin:**  
  - `admin_users` and `user_roles` tables manage permissions and dashboard access.

---

## Future Reference
This architecture is now indexed for your project. If you add or modify tables/policies, just let me know and I’ll update this master document.

---

**If you want this as an ERD or want to add more details, let me know!**
