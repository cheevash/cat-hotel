-- Create reviews table
create table reviews (
  id uuid default uuid_generate_v4() primary key,
  booking_id uuid references bookings(id) not null,
  user_id uuid references auth.users(id) not null,
  rating integer check (rating >= 1 and rating <= 5) not null,
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table reviews enable row level security;

-- Policy: Everyone can view reviews
create policy "Public reviews are viewable by everyone"
  on reviews for select
  using ( true );

-- Policy: Authenticated users can insert their own reviews
create policy "Users can insert their own reviews"
  on reviews for insert
  with check ( auth.uid() = user_id );

-- Policy: Users can update their own reviews
create policy "Users can update their own reviews"
  on reviews for update
  using ( auth.uid() = user_id );
