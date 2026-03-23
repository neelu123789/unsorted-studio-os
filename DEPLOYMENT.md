# Unsorted Studio OS — Deployment Guide

## What changed: localStorage → Supabase

**Before:** All data lived in your browser's `localStorage`. Only visible on one device, never synced to your team.

**After:** All data lives in Supabase (PostgreSQL database + file storage). Any device, any team member, real-time.

---

## Step 1: Create a Supabase project (5 minutes)

1. Go to [supabase.com](https://supabase.com) → **Start your project** (free tier is enough)
2. Create a new project → choose a region closest to India (ap-south-1 = Mumbai)
3. Wait ~2 minutes for the project to spin up
4. Go to **Project Settings → API** — copy:
   - **Project URL** → looks like `https://xxxxxxxxxxxx.supabase.co`
   - **anon public** key → long `eyJ...` string

---

## Step 2: Run the database schema (2 minutes)

1. In Supabase Dashboard → **SQL Editor** → **New query**
2. Open the file `supabase/schema.sql` from this project
3. Paste the entire contents → click **Run**
4. You should see "Success. No rows returned."

This creates all 8 tables (clients, projects, deliverables, tasks, invoices, meetings, files, notes), sets up Row Level Security, and creates the file storage bucket.

---

## Step 3: Set up environment variables (1 minute)

In the project root, create a file named `.env`:

```
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_KEY_HERE
```

Replace both values with the ones you copied in Step 1.

**Test locally:**
```bash
npm install
npm run dev
```

Open `http://localhost:5173` — you should see "Loading workspace…" briefly, then the empty dashboard.

---

## Step 4: Deploy to Vercel (3 minutes)

### Option A: Via Vercel CLI
```bash
npm install -g vercel
vercel
# Follow prompts — framework: Vite, output: dist
```

### Option B: Via GitHub (recommended for team)
1. Push this project to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import from GitHub
3. Select your repo → **Deploy**

### Add environment variables in Vercel:
1. Vercel Dashboard → Your project → **Settings → Environment Variables**
2. Add both variables:
   - `VITE_SUPABASE_URL` = your project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
3. **Redeploy** the project (Settings → Deployments → Redeploy)

Your team can now all open the same Vercel URL and see the same data.

---

## How the file storage works

When you upload a file (contract, design, invoice), Studio OS:

1. Converts it to a blob and uploads to **Supabase Storage** (`studio-files` bucket)
2. Generates a **7-day signed URL** for downloads/portal access
3. Saves the metadata (name, category, client, etc.) to the `files` table
4. The signed URL is auto-refreshed on next app load

> **File size limit:** 50MB per file (adjustable in Supabase Storage settings)

---

## Team access — who can see what?

| User | Access |
|------|--------|
| You (studio) | Full access via Vercel URL — all clients, all data |
| Teammate | Same Vercel URL — same full access |
| Client | Their portal URL `?portal=tok_xxx` — only sees shared files + their project |

There's no login system yet — the Vercel URL is your "password". If you want to lock it down, you can add Vercel Password Protection (free) in Vercel Dashboard → Settings → Password Protection.

---

## Database tables created

| Table | What it stores |
|-------|---------------|
| `clients` | Client profiles, contact info, portal tokens |
| `projects` | Project details, progress, status |
| `deliverables` | Individual deliverables per project |
| `tasks` | To-do items, priority, due dates |
| `invoices` | Payment records (paid/pending, auto-overdue) |
| `meetings` | Scheduled calls, Zoom/Meet links |
| `files` | File metadata (actual files in Storage) |
| `notes` | Per-client notes |

---

## Troubleshooting

**"Cannot connect to Supabase" error**
→ Check `.env` file exists and has the correct values (no quotes around the values)
→ Make sure you ran `npm run dev` after creating `.env` (Vite only reads env on startup)

**Files not uploading / downloading**
→ Make sure the `studio-files` storage bucket was created by the schema (check Supabase Storage tab)
→ Files > 50MB will fail — increase the limit in Supabase Storage settings

**Data shows on my machine but not teammate's**
→ You haven't added the env vars to Vercel yet — see Step 4

**Supabase free tier limits**
- 500MB database storage (enough for hundreds of clients)
- 1GB file storage (enough for ~200 design PDFs)
- 50,000 monthly API requests (more than enough for a small studio)
- Upgrade to Pro ($25/month) only when you exceed these

---

## Local dev reminder

Always run with:
```bash
npm run dev
```

Build for production:
```bash
npm run build
npm run preview  # test the built version locally
```
