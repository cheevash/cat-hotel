-- Create the storage bucket for rooms
insert into storage.buckets (id, name, public)
values ('rooms', 'rooms', true);

-- Policy to allow anyone to view images
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'rooms' );

-- Policy to allow authenticated users (admin) to upload images
create policy "Authenticated users can upload images"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'rooms' );

-- Policy to allow authenticated users (admin) to update images
create policy "Authenticated users can update images"
on storage.objects for update
to authenticated
using ( bucket_id = 'rooms' );

-- Policy to allow authenticated users (admin) to delete images
create policy "Authenticated users can delete images"
on storage.objects for delete
to authenticated
using ( bucket_id = 'rooms' );
