-- Create the storage bucket for payment slips
insert into storage.buckets (id, name, public)
values ('payment-slips', 'payment-slips', true);

-- Policy to allow public access to view slips (optional, or restrict to auth users)
create policy "Public Access to Payment Slips"
  on storage.objects for select
  using ( bucket_id = 'payment-slips' );

-- Policy to allow authenticated users to upload slips
create policy "Authenticated Users Can Upload Slips"
  on storage.objects for insert
  with check (
    bucket_id = 'payment-slips'
    and auth.role() = 'authenticated'
  );

-- Policy to allow users to update their own slips (optional)
create policy "Users Can Update Own Slips"
  on storage.objects for update
  using (
    bucket_id = 'payment-slips'
    and auth.uid() = owner
  );
