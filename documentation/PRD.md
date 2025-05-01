# Product Requirements Document (PRD)

## Project: Pitch Pal Chatbot for American Home Design

### 1. Overview
Pitch Pal is a secure, mobile-first AI chatbot for American Home Design salespeople, leveraging internal sales documents to answer real-time sales questions. Built on the Vercel AI Chatbot repo, it is tightly scoped to the knowledge base and managed by an admin.

### 2. Key Features
- **Authentication:** Supabase Auth (no self-signup; admin creates and manages users via custom dashboard). Password reset by admin and by users (Supabase email reset flow).
- **Knowledge Base:** Upload .txt (initially), PDF, and image files (future). Global knowledge base, updated a few times per year. Files stored and indexed in Ducky.ai for RAG (no longer in Vercel Blob).
- **RAG Pipeline:** All knowledge base files are uploaded to Ducky.ai, which handles chunking, embedding, and retrieval. The chatbot queries Ducky.ai for relevant context to augment answers.
- **Chatbot:** Uses xAI (preferred, with fallback to Groq/OpenAI) via AI SDK, strictly limited to knowledge base for answers. Friendly, sales-focused personality (Pitch Pal). Citations/sources included in responses. Admin can edit bot instructions/personality, scope, responsibilities, style, and model via dashboard settings.
- **Chatbot Training:** Admins can review and correct chatbot answers via a Training interface. Corrections are stored in the RAG table and used to improve future responses. Feedback and corrections workflow integrated with flagged answers.
- **Chat History:** Persistent per user, visible in hamburger menu. Admin can view all users’ chat histories via dashboard (select user dropdown).
- **Feedback:** Users can flag answers with required comments. Admin dashboard shows flagged feedback with user, timestamp, original Q&A, and full conversation. Admin can review, correct, add to training, or mark as completed.
- **Admin Dashboard:**
    - Manage users (Supabase), reset passwords, upload/manage knowledge base
    - View chats/feedback, adjust xAI settings, see analytics (total chats, tokens in/out, API cost, FAQ table, usage ranking, pending invites)
    - Edit chatbot instructions/personality, scope, responsibilities, style, and model
    - Manage training/corrections
    - View API connection status (Supabase, Ducky.ai, Vercel, xAI, OpenAI)
    - Only visible to users with the admin role. Accessible via top navigation button when authenticated as admin.
- **Branding:** Custom logos and colors as provided. Pitch Pal avatar for chatbot, user avatar is first initial.
- **UI:** Minimal, mobile-first. Login → full-screen chat. Simple navigation.
- **File Storage:** Ducky.ai for all knowledge base documents and attachments (no longer using Vercel Blob).
- **Database:** Supabase (Postgres + Drizzle ORM).

### 3. Architecture
- Next.js (App Router, RSCs)
- AI SDK (xAI preferred, fallback Groq/OpenAI, RAG with knowledge base)
- Supabase Auth & Database (Postgres + Drizzle ORM)
- Ducky.ai (managed RAG: chunking, embedding, retrieval)
- Tailwind CSS + shadcn/ui
- Hosted on Vercel

### 4. User Roles
- **User:** Salesperson. Access chat, view/edit own history, flag answers, change password.
- **Admin:** Full access to dashboard, user management (Supabase), knowledge base, analytics, view all chats/feedback, reset passwords, edit chatbot instructions/personality/scope/model, review/correct answers, manage training.

### 5. Dashboard & Analytics
- Visuals: total chats, tokens in/out, API cost (xAI), feedback logs
- Table: most frequently asked questions (from chat history), filterable by time range (week/month/year)
- Show connection status for Supabase, Ducky.ai, Vercel, xAI, OpenAI
- Show users ranked by usage
- Show pending email invites (if possible)

### 6. Settings
- Set chatbot personality, scope, responsibilities, response style, abilities, and guardrails
- Select xAI model (show token costs in/out, show Vercel API balance)

### 7. Feedback, Training, and Chat History
- Feedback: Users flag responses, provide correct answer; admins review, update training, mark as complete
- Training: Integrate feedback into RAG/corrections workflow
- Chat History: Admin can select user and view full chat history

### 8. Branding Assets
- Main header logo: /public/images/american-home-design-logo-main.jpg
- Favicon: /public/images/american-home-design-logo-square.jpg
- Pitch Pal logo (login): /public/images/pitch-pal-logo.png
- Pitch Pal avatar: /public/images/pitch-pal-avatar.png

### 9. Mobile Experience
- 99% mobile traffic expected
- Responsive, mobile-first UI

### 10. RAG Flow
    1. Knowledge base files uploaded via admin dashboard
    2. Files are uploaded directly to Ducky.ai, which handles chunking, embedding, and retrieval (no longer stored in Vercel Blob or chunked in Supabase)
    3. Retrieval and context injection for chatbot answers is handled via Ducky.ai API

---

## Steps & Milestones
See `/documentation/tasks/steps.md` for detailed progress tracking.

---

## Open Questions
- Any additional analytics/reporting desired?
- Timeline for future PDF/image knowledge base support?

---

_Last updated: 2025-04-20_
