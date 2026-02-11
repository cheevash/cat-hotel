-- Create a new private bucket 'cat-images' (if not exists)
insert into storage.buckets (id, name, public)
values ('cat-images', 'cat-images', true)
on conflict (id) do nothing;

-- Policy to allow public to view images
-- Using specific name to avoid conflict
create policy "Public Access cat-images"
  on storage.objects for select
  using ( bucket_id = 'cat-images' );

-- Policy to allow authenticated users to upload images
create policy "Authenticated users can upload cat-images"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'cat-images' );

-- Policy to allow users to update their own images
create policy "Users can update their own cat-images"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'cat-images' );

-- Policy to allow users to delete their own images
create policy "Users can delete their own cat-images"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'cat-images' );
