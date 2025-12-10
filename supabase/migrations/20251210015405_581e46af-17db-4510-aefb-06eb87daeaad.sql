-- Add archived column to estimates table
ALTER TABLE public.estimates 
ADD COLUMN is_archived boolean NOT NULL DEFAULT false;

-- Add archived_at timestamp
ALTER TABLE public.estimates 
ADD COLUMN archived_at timestamp with time zone DEFAULT NULL;