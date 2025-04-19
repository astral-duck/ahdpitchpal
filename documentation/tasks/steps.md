# Implementation Steps & Milestones

## Step 1: Project Setup & Branding
- [x] Fork/clone Vercel AI Chatbot repo
- [x] Configure Next.js, Tailwind, shadcn/ui
- [x] Add American Home Design branding (logos, favicon, colors)

## Step 2: Authentication & User Management (Supabase)
- [x] Integrate Supabase Auth, disable self-signup
- [ ] Custom admin dashboard for user creation/removal (Supabase)
- [ ] Password reset for admin and users (Supabase email reset flow)

## Step 3: Knowledge Base Integration
- [ ] Knowledge base upload (admin dashboard, .txt files)
- [ ] Store docs in Vercel Blob
- [ ] RAG pipeline for chatbot (strict to knowledge base)
- [ ] Citations/sources in responses

## Step 4: Chatbot & Chat History
- [x] Integrate Grok via AI SDK
- [x] Mobile-first chat UI (login → full-screen chat)
- [x] Persistent chat history (user & admin views, via Supabase user ID)
- [x] Hamburger menu for user chat history

## Step 5: Feedback & Flagging
- [ ] Feedback/flag function on answers (required comment)
- [ ] Admin dashboard view for flagged responses (user, timestamp, Q&A, full convo)

## Step 6: Admin Dashboard
- [ ] Manage users (Supabase), knowledge base, feedback, Grok settings
- [ ] Analytics: top 5 FAQs, usage stats

## Step 7: Testing & Launch
- [ ] E2E tests (Playwright)
- [ ] Final QA, bugfixes
- [ ] Deploy to Vercel (ahdpitchpal.com)

---

_Last updated: 2025-04-19_
