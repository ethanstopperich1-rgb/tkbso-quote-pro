-- Run this in your Supabase SQL Editor to set up the quote-photos storage bucket
-- Dashboard → SQL Editor → New Query → paste → Run

-- 1. Create the storage bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'quote-photos',
  'quote-photos',
  true,                          -- public bucket (URLs are shareable in PDF quotes)
  10485760,                      -- 10MB max per file
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do nothing;

-- 2. Allow authenticated users to upload
create policy "Authenticated users can upload photos"
on storage.objects for insert
to authenticated
with check (bucket_id = 'quote-photos');

-- 3. Allow authenticated users to read their uploads
create policy "Authenticated users can view photos"
on storage.objects for select
to authenticated
using (bucket_id = 'quote-photos');

-- 4. Allow authenticated users to delete their own photos
create policy "Authenticated users can delete photos"
on storage.objects for delete
to authenticated
using (bucket_id = 'quote-photos');

-- 5. Allow public read (needed for Qwen Vision API to fetch image URLs)
create policy "Public read access for quote photos"
on storage.objects for select
to anon
using (bucket_id = 'quote-photos');
