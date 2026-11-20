-- Run once in the Supabase SQL editor.
create table if not exists app_state (id text primary key, data jsonb not null);
alter table app_state enable row level security;
-- shortcut: anyone with the anon key can read/write; add auth before sharing the URL publicly.
create policy "anon all" on app_state for all to anon using (true) with check (true);
