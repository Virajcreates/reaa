# Implementation Plan: Authentication & Persistent Chat History

This plan outlines the steps to implement user authentication (Google OAuth + Email/Password) and persistent, sidebar-accessible chat history (similar to Gemini/ChatGPT) using your existing Supabase infrastructure.

## Architecture Overview

Since you are already using Supabase as your Vector Database, it is the perfect tool for this task:
1. **Authentication**: We will use Supabase Auth. It natively supports Google OAuth and Email/Password out of the box.
2. **Database**: We will create two new Postgres tables: `chats` (to store chat sessions) and `messages` (to store the back-and-forth history of each chat).
3. **CORS Issues**: **No.** The official `@supabase/supabase-js` client handles CORS perfectly from the browser. However, there are some Google Cloud configurations you *must* get right to avoid OAuth errors.

> **Precautions for Google Authentication**
> To prevent Google OAuth "Redirect URI Mismatch" errors, you MUST configure the **Authorized Redirect URIs** in your Google Cloud Console to exactly match your Supabase project URL (e.g., `https://[PROJECT_ID].supabase.co/auth/v1/callback`). You must also add this URL to the Supabase Authentication providers dashboard.

## Open Questions for You

**1. Database Setup**
Since I cannot access your Supabase dashboard directly, I will need to provide you with a SQL script to copy/paste into your Supabase SQL Editor. This script will create the `chats` and `messages` tables and secure them using Row Level Security (RLS) so users can only see their own chats. 
*Are you comfortable running this SQL script?*

**2. Session IDs**
Currently, the app uses a random temporary `sessionId` for PDF uploads. When a user logs in, do you want to tie uploaded PDFs directly to their User ID (so they can ask about them in any chat), or tie them to the specific Chat ID (so different chats have completely different PDF contexts)? 
*(Tying to Chat ID is recommended to keep things organized).*

---

## Proposed Changes

### 1. Supabase Schema (SQL)
- A script to create `chats` (id, user_id, title, created_at) and `messages` (id, chat_id, role, content, sources, created_at) tables.
- RLS Policies to ensure privacy.

### 2. Frontend Components
- **`src/hooks/useAuth.ts`**: React hook to manage Supabase session state, login, signup, and Google OAuth flow.
- **`src/components/auth/AuthModal.tsx`**: A beautiful glassmorphism modal for users to sign in or sign up.
- **`src/components/layout/Sidebar.tsx`**: A sliding sidebar on the left side of the screen (similar to Gemini) to display past chats, create a "New Chat", and log out.

### 3. Modifying Existing Code
- **`src/hooks/useChat.ts`**: Update the hook to fetch historic messages from Supabase when a `chatId` is provided, and automatically save new user and AI messages to the `messages` table.
- **`src/components/pages/ChatPage.tsx`**: Wrap the chat interface in a layout that includes the new `Sidebar`. Handle routing/state for switching between different `chatId`s, and enforce authentication (show the `AuthModal` if the user is not logged in).
