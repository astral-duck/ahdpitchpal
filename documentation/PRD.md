# Product Requirements Document (PRD)

## Project: Pitch Pal Chatbot for American Home Design

### 1. Overview
Pitch Pal is a secure, mobile-first AI chatbot for American Home Design salespeople, leveraging internal sales documents to answer real-time sales questions. Built on the Vercel AI Chatbot repo, it is tightly scoped to the knowledge base and managed by an admin.

### 2. Key Features
- **Authentication:** Supabase Auth (no self-signup; admin creates and manages users via custom dashboard). Password reset by admin and by users (Supabase email reset flow).
- **Knowledge Base:** Upload .txt (initially), PDF, and image files (future). Global knowledge base, updated a few times per year. Files stored in blob storage, chunked and indexed in Supabase for RAG.
- **RAG Pipeline:** All knowledge base files are chunked and stored in a Supabase `rag_chunks` table with embeddings (pgvector), citations, and correction fields. Chatbot queries this table for retrieval-augmented answers.
- **Chatbot:** Uses Grok (xAI) via AI SDK, strictly limited to knowledge base for answers, with math and image interpolation. Friendly, sales-focused personality (Pitch Pal). Citations/sources included in responses. Admin can edit bot instructions/personality via dashboard.
- **Chatbot Training:** Admins can review and correct chatbot answers via a Training interface. Corrections are stored in the RAG table and used to improve future responses.
- **Chat History:** Persistent per user, visible in hamburger menu. Admin can view all users’ chat histories via dashboard.
- **Feedback:** Users can flag answers with required comments. Admin dashboard shows flagged feedback with user, timestamp, original Q&A, and full conversation.
- **Admin Dashboard:** Manage users (Supabase), reset passwords, upload/manage knowledge base, view chats/feedback, adjust Grok settings, see analytics (top 5 FAQs, usage stats), edit chatbot instructions/personality, and manage training/corrections. Only visible to users with the admin role. Accessible via top navigation button when authenticated as admin.
- **Branding:** Custom logos and colors as provided. Pitch Pal avatar for chatbot, user avatar is first initial.
- **UI:** Minimal, mobile-first. Login → full-screen chat. Simple navigation.
- **File Storage:** Vercel Blob for attachments and knowledge docs.
- **Database:** Supabase (Postgres + pgvector) + Drizzle ORM.

### 3. Architecture
- Next.js (App Router, RSCs)
- AI SDK (Grok, RAG with knowledge base)
- Supabase Auth & Database (Postgres + pgvector) + Drizzle ORM
- Vercel Blob Storage
- Tailwind CSS + shadcn/ui
- Hosted on Vercel

### 4. User Roles
- **User:** Salesperson. Access chat, view/edit own history, flag answers, change password.
- **Admin:** Full access to dashboard, user management (Supabase), knowledge base, analytics, view all chats/feedback, reset passwords, edit chatbot instructions/personality, review/correct answers.

### 5. Analytics
- Top 5 most frequently asked questions
- Usage stats (per user, per time period)

### 6. Branding Assets
- Main header logo: /public/images/american-home-design-logo-main.jpg
- Favicon: /public/images/american-home-design-logo-square.jpg
- Pitch Pal logo (login): /public/images/pitch-pal-logo.png
- Pitch Pal avatar: /public/images/pitch-pal-avatar.png

### 7. Mobile Experience
- 99% mobile traffic expected
- Responsive, mobile-first UI

---

## Steps & Milestones
See `/documentation/tasks/steps.md` for detailed progress tracking.

---

## Open Questions
- Any additional analytics/reporting desired?
- Timeline for future PDF/image knowledge base support?

---

_Last updated: 2025-04-19_
