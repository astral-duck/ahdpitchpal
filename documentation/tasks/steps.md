# Implementation Steps & Milestones

## Step 1: Project Setup & Branding
- [x] Fork/clone Vercel AI Chatbot repo
- [x] Configure Next.js, Tailwind, shadcn/ui
- [x] Add American Home Design branding (logos, favicon, colors)

## Step 2: Authentication & User Management (Supabase)
- [x] Integrate Supabase Auth, disable self-signup
- [x] Custom admin dashboard for user creation/removal (Supabase). Access only for admin role via main navigation.
- [x] Password reset for admin and users (Supabase email reset flow)

## Step 3: Knowledge Base Integration
- [x] Knowledge base upload (admin dashboard, .txt files)
- [x] Store docs in Vercel Blob
- [x] Chunk uploaded files and insert into Supabase `rag_chunks` table with embeddings
- [x] RAG pipeline for chatbot (strict to knowledge base)
- [x] Citations/sources in responses

## Step 4: Chatbot & Chat History
- [x] Integrate Grok via AI SDK
- [x] Mobile-first chat UI (login → full-screen chat)
- [x] Persistent chat history (user & admin views, via Supabase user ID)
- [x] Hamburger menu for user chat history

## Step 5: Feedback, Flagging, & Training
- [ ] Feedback/flag function on answers (required comment)
- [ ] Admin dashboard view for flagged responses (user, timestamp, Q&A, full convo)
- [ ] Admin training interface: review/correct answers, save corrections to RAG table

## Step 6: Admin Dashboard Integration
- [x] Scaffolded nextjs-dashboard template into /app/admin, replacing placeholder UI
- [x] Connected dashboard to Supabase for:
    - User management (list, create, remove users)
    - Knowledge base management (upload .txt, view/manage docs in blob)
- [x] Connect dashboard to Supabase for:
    - Feedback review (flagged answers, user info, full convo)
    - Chat History (admin can select user, view full history)
    - Chatbot instructions/personality editing (Settings)
    - Training/corrections management
    - API connection status (Supabase, Blob, Vercel, xAI, OpenAI)
- [x] Ensure admin-only access via UserRoleContext
- [x] Fixed admin reload: reload on /admin pages no longer redirects to chatbot
- [x] Updated analytics section to Chat History as per latest requirements
- [ ] Replace all sample/stat placeholder data with live data from Supabase and blob storage
- [ ] Polish UI for branding and mobile responsiveness

## Step 7: Testing & Launch
- [ ] E2E tests (Playwright)
- [ ] Final QA, bugfixes
- [ ] Deploy to Vercel (ahdpitchpal.com)

---

# Next Steps / Suggestions

- [ ] Implement feedback/flagging on answers for users (with required comment)
- [ ] Build admin dashboard view for flagged responses (with filters/search)
- [ ] Enhance training interface for admins to review/correct answers and update RAG table
- [ ] UI/UX polish for admin dashboard and chat history
- [ ] (When ready) Integrate live xAI billing API for real-time usage/cost tracking
- [ ] Add notifications or logs for admin actions (user creation, file uploads, etc)

---

**What would you like to tackle next?**
- Feedback/flagging system
- Flagged response admin view
- Training/corrections UI
- UI/UX polish
- xAI billing integration (when ready)
- Something else?

Let me know your priority or if you want a suggestion!

---

_Last updated: 2025-04-20_
