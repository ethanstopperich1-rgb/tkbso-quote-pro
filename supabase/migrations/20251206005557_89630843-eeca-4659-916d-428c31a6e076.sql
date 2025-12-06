-- Create a storage bucket for estimate photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('estimate-photos', 'estimate-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for estimate photos bucket
CREATE POLICY "Users can upload photos to their estimates"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'estimate-photos' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM estimates WHERE contractor_id = get_user_contractor_id(auth.uid())
  )
);

CREATE POLICY "Users can view photos from their estimates"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'estimate-photos'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM estimates WHERE contractor_id = get_user_contractor_id(auth.uid())
  )
);

CREATE POLICY "Users can delete photos from their estimates"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'estimate-photos'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM estimates WHERE contractor_id = get_user_contractor_id(auth.uid())
  )
);

-- Public read access for estimate photos
CREATE POLICY "Public can view estimate photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'estimate-photos');