-- Create update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add takeoffs table for visual measurement tool
CREATE TABLE IF NOT EXISTS public.takeoffs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contractor_id UUID NOT NULL REFERENCES public.contractors(id) ON DELETE CASCADE,
  created_by_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  estimate_id UUID REFERENCES public.estimates(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_width INTEGER,
  image_height INTEGER,
  scale_ratio NUMERIC,
  calibration_points JSONB,
  polygon_coordinates JSONB,
  calculated_sqft NUMERIC,
  calculated_perimeter NUMERIC,
  room_label TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.takeoffs ENABLE ROW LEVEL SECURITY;

-- Policies for takeoffs
CREATE POLICY "Users can view takeoffs in their contractor org"
ON public.takeoffs
FOR SELECT
USING (
  contractor_id IN (
    SELECT contractor_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can create takeoffs in their contractor org"
ON public.takeoffs
FOR INSERT
WITH CHECK (
  contractor_id IN (
    SELECT contractor_id FROM public.profiles WHERE id = auth.uid()
  )
  AND created_by_profile_id = auth.uid()
);

CREATE POLICY "Users can update takeoffs in their contractor org"
ON public.takeoffs
FOR UPDATE
USING (
  contractor_id IN (
    SELECT contractor_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can delete takeoffs in their contractor org"
ON public.takeoffs
FOR DELETE
USING (
  contractor_id IN (
    SELECT contractor_id FROM public.profiles WHERE id = auth.uid()
  )
);

-- Add updated_at trigger
CREATE TRIGGER update_takeoffs_updated_at
BEFORE UPDATE ON public.takeoffs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for faster lookups
CREATE INDEX idx_takeoffs_contractor_id ON public.takeoffs(contractor_id);
CREATE INDEX idx_takeoffs_estimate_id ON public.takeoffs(estimate_id);

COMMENT ON TABLE public.takeoffs IS 'Visual takeoff measurements from floor plans';
COMMENT ON COLUMN public.takeoffs.scale_ratio IS 'Pixels per foot ratio from calibration';
COMMENT ON COLUMN public.takeoffs.calibration_points IS 'Two points used for scale calibration';
COMMENT ON COLUMN public.takeoffs.polygon_coordinates IS 'Array of x,y points defining the measured area';