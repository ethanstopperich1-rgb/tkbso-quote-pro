-- Create pricing overrides table for contractor-specific pricing customization
CREATE TABLE public.pricing_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id uuid NOT NULL REFERENCES public.contractors(id) ON DELETE CASCADE,
  item_key text NOT NULL,
  custom_cost numeric,
  custom_price numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(contractor_id, item_key)
);

-- Enable RLS
ALTER TABLE public.pricing_overrides ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their pricing overrides"
ON public.pricing_overrides
FOR SELECT
USING (contractor_id = get_user_contractor_id(auth.uid()));

CREATE POLICY "Users can insert pricing overrides"
ON public.pricing_overrides
FOR INSERT
WITH CHECK (contractor_id = get_user_contractor_id(auth.uid()));

CREATE POLICY "Users can update their pricing overrides"
ON public.pricing_overrides
FOR UPDATE
USING (contractor_id = get_user_contractor_id(auth.uid()));

CREATE POLICY "Users can delete their pricing overrides"
ON public.pricing_overrides
FOR DELETE
USING (contractor_id = get_user_contractor_id(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_pricing_overrides_updated_at
BEFORE UPDATE ON public.pricing_overrides
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();