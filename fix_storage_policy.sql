-- Drop existing policies to start fresh (ignore errors if they don't exist)
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Authenticated users can upload images" on storage.objects;
drop policy if exists "Authenticated users can update images" on storage.objects;
drop policy if exists "Authenticated users can delete images" on storage.objects;
drop policy if exists "Public Upload" on storage.objects;
drop policy if exists "Public Update" on storage.objects;
drop policy if exists "Public Delete" on storage.objects;

-- 1. Allow Public Read (VIEW) - Everyone can see images
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'rooms' );

-- 2. Allow Public Upload (INSERT) - for testing immediately
create policy "Public Upload"
on storage.objects for insert
with check ( bucket_id = 'rooms' );

-- 3. Allow Public Update - for editing
create policy "Public Update"
on storage.objects for update
using ( bucket_id = 'rooms' );

-- 4. Allow Public Delete - for deleting
create policy "Public Delete"
on storage.objects for delete
using ( bucket_id = 'rooms' );
