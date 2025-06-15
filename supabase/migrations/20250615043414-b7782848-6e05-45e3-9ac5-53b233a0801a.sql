
-- 1. Create a public storage bucket named "uploads"
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

-- 2. Create a "files" table to track uploads
create table public.files (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  original_filename text not null,
  storage_path text not null,
  uploaded_at timestamp with time zone default now() not null
);

-- 3. Enable RLS and add policies so users can only access their own file records
alter table public.files enable row level security;

create policy "Allow each user to view their own files"
  on public.files for select
  using (auth.uid() = user_id);

create policy "Allow users to insert their own files"
  on public.files for insert
  with check (auth.uid() = user_id);

create policy "Allow users to delete their own files"
  on public.files for delete
  using (auth.uid() = user_id);

-- 4. (optional, but recommended) Add a foreign key to link to the profiles table if you want referential integrity
alter table public.files
  add constraint files_user_id_fkey
  foreign key (user_id) references public.profiles(id) on delete cascade;
