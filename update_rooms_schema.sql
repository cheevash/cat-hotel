-- Add new columns to rooms table
alter table "public"."rooms"
add column if not exists "images" text[] default '{}',
add column if not exists "amenities" jsonb default '[]',
add column if not exists "rules" text[] default '{}',
add column if not exists "room_size" text,
add column if not exists "capacity" text;

-- Comment on columns
comment on column "public"."rooms"."images" is 'Array of additional image URLs';
comment on column "public"."rooms"."amenities" is 'JSON array of amenity objects';
comment on column "public"."rooms"."rules" is 'Array of rule strings';
