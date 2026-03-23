-- ============================================================
-- UNSORTED STUDIO OS — SUPABASE SCHEMA v2
-- Run this entire file in Supabase SQL Editor
-- Dashboard → SQL Editor → New query → paste → Run
-- Safe to run multiple times — drops and recreates everything
-- ============================================================

-- ── ENABLE UUID EXTENSION ──────────────────────────────────
create extension if not exists "pgcrypto";

-- ── DROP STORAGE POLICIES (fix for "already exists" error) ─
drop policy if exists "studio_upload" on storage.objects;
drop policy if exists "studio_read"   on storage.objects;
drop policy if exists "studio_delete" on storage.objects;

-- ── DROP EXISTING TABLES (clean reinstall) ─────────────────
drop table if exists notes        cascade;
drop table if exists files        cascade;
drop table if exists meetings     cascade;
drop table if exists invoices     cascade;
drop table if exists tasks        cascade;
drop table if exists deliverables cascade;
drop table if exists projects     cascade;
drop table if exists clients      cascade;

-- ── DROP EXISTING VIEWS ────────────────────────────────────
drop view if exists invoices_with_status;

-- ── CLIENTS ────────────────────────────────────────────────
create table clients (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz default now(),
  name          text not null,
  brand         text not null,
  email         text,
  phone         text,
  type          text default 'D2C',
  stage         text default 'discovery',
  avatar        text,
  photo_url     text,
  color         text default '#5CB83A',
  onboarded     date default current_date,
  budget        numeric,
  notes         text,
  portal_token  text unique default 'tok_' || encode(gen_random_bytes(12), 'hex')
);

-- ── PROJECTS ───────────────────────────────────────────────
create table projects (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  client_id   uuid references clients(id) on delete cascade,
  name        text not null,
  status      text default 'not-started',
  due         date,
  value       numeric,
  progress    integer default 0,
  description text
);

-- ── DELIVERABLES ───────────────────────────────────────────
create table deliverables (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  project_id  uuid references projects(id) on delete cascade,
  name        text not null,
  status      text default 'not-started',
  due         date
);

-- ── TASKS ──────────────────────────────────────────────────
create table tasks (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  client_id   uuid references clients(id) on delete set null,
  project_id  uuid references projects(id) on delete set null,
  title       text not null,
  priority    text default 'med',
  due         date,
  done        boolean default false
);

-- ── INVOICES ───────────────────────────────────────────────
create table invoices (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  client_id   uuid references clients(id) on delete cascade,
  number      text,
  amount      numeric not null,
  status      text default 'pending',
  date        date default current_date,
  due         date,
  description text
);

-- ── MEETINGS ───────────────────────────────────────────────
create table meetings (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  client_id   uuid references clients(id) on delete set null,
  title       text not null,
  date        date,
  time        time,
  duration    integer default 60,
  type        text default 'general',
  link        text,
  notes       text
);

-- ── FILES ──────────────────────────────────────────────────
create table files (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz default now(),
  client_id           uuid references clients(id) on delete cascade,
  name                text not null,
  storage_path        text,
  public_url          text,
  size                text,
  file_type           text,
  category            text default 'general',
  uploaded_by         text default 'studio',
  shared_with_client  boolean default false,
  signature_required  boolean default false,
  signed_back         boolean default false
);

-- ── NOTES ──────────────────────────────────────────────────
create table notes (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  client_id   uuid references clients(id) on delete cascade,
  content     text not null
);

-- ── ROW LEVEL SECURITY ─────────────────────────────────────
alter table clients       enable row level security;
alter table projects      enable row level security;
alter table deliverables  enable row level security;
alter table tasks         enable row level security;
alter table invoices      enable row level security;
alter table meetings      enable row level security;
alter table files         enable row level security;
alter table notes         enable row level security;

-- Drop table-level policies if they already exist (re-run safe)
do $$ begin
  drop policy if exists "portal_read_client"   on clients;
  drop policy if exists "portal_read_projects" on projects;
  drop policy if exists "portal_read_files"    on files;
  drop policy if exists "portal_read_invoices" on invoices;
  drop policy if exists "portal_read_delivs"   on deliverables;
  -- Full access policies for all tables
  drop policy if exists "full_access_clients"      on clients;
  drop policy if exists "full_access_projects"     on projects;
  drop policy if exists "full_access_deliverables" on deliverables;
  drop policy if exists "full_access_tasks"        on tasks;
  drop policy if exists "full_access_invoices"     on invoices;
  drop policy if exists "full_access_meetings"     on meetings;
  drop policy if exists "full_access_files"        on files;
  drop policy if exists "full_access_notes"        on notes;
end $$;

-- Allow full read/write for everyone (anon key)
-- Your app doesn't use auth — the anon key is your "studio key"
create policy "full_access_clients"      on clients      for all using (true) with check (true);
create policy "full_access_projects"     on projects     for all using (true) with check (true);
create policy "full_access_deliverables" on deliverables for all using (true) with check (true);
create policy "full_access_tasks"        on tasks        for all using (true) with check (true);
create policy "full_access_invoices"     on invoices     for all using (true) with check (true);
create policy "full_access_meetings"     on meetings     for all using (true) with check (true);
create policy "full_access_files"        on files        for all using (true) with check (true);
create policy "full_access_notes"        on notes        for all using (true) with check (true);

-- ── STORAGE BUCKET ─────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit)
values ('studio-files', 'studio-files', false, 52428800)
on conflict (id) do nothing;

-- Storage policies (dropped at top of file so these always succeed)
create policy "studio_upload" on storage.objects
  for insert with check (bucket_id = 'studio-files');

create policy "studio_read" on storage.objects
  for select using (bucket_id = 'studio-files');

create policy "studio_delete" on storage.objects
  for delete using (bucket_id = 'studio-files');

-- ── INVOICE STATUS VIEW ────────────────────────────────────
create or replace view invoices_with_status as
  select *,
    case
      when status = 'paid'    then 'paid'
      when due < current_date then 'overdue'
      else 'pending'
    end as computed_status
  from invoices;
