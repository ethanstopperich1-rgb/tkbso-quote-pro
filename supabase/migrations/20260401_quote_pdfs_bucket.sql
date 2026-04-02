-- Migration: set up quote-pdfs storage bucket
-- Run in Supabase SQL Editor

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'quote-pdfs',
  'quote-pdfs',
  false,                        -- private bucket (signed URLs only)
  52428800,                     -- 50MB max
  array['application/pdf', 'text/html']
)
on conflict (id) do nothing;

-- Authenticated users can upload their own PDFs
create policy "Authenticated upload quote-pdfs"
on storage.objects for insert
to authenticated
with check (bucket_id = 'quote-pdfs');

-- Authenticated users can read their own PDFs
create policy "Authenticated read quote-pdfs"
on storage.objects for select
to authenticated
using (bucket_id = 'quote-pdfs');

-- Service role full access (Edge Function)
create policy "Service role quote-pdfs"
on storage.objects for all
using (bucket_id = 'quote-pdfs')
with check (bucket_id = 'quote-pdfs');
