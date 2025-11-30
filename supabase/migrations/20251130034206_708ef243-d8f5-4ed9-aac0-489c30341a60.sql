-- Add settings JSONB column to contractors table
ALTER TABLE public.contractors 
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

-- Create storage bucket for contractor assets (logos, insurance docs)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'contractor-assets', 
  'contractor-assets', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/svg+xml', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for contractor assets
CREATE POLICY "Users can view their contractor assets"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'contractor-assets' 
  AND (storage.foldername(name))[1] = get_user_contractor_id(auth.uid())::text
);

CREATE POLICY "Users can upload their contractor assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'contractor-assets' 
  AND (storage.foldername(name))[1] = get_user_contractor_id(auth.uid())::text
);

CREATE POLICY "Users can update their contractor assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'contractor-assets' 
  AND (storage.foldername(name))[1] = get_user_contractor_id(auth.uid())::text
);

CREATE POLICY "Users can delete their contractor assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'contractor-assets' 
  AND (storage.foldername(name))[1] = get_user_contractor_id(auth.uid())::text
);