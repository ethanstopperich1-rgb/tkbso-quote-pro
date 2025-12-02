-- Create product_mappings table for BigBox API integration
CREATE TABLE IF NOT EXISTS public.product_mappings (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  contractor_id UUID NOT NULL REFERENCES public.contractors(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_description TEXT,
  trade_bucket TEXT NOT NULL,
  pricing_field TEXT NOT NULL,
  current_price NUMERIC NOT NULL,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(contractor_id, sku)
);

-- Enable RLS
ALTER TABLE public.product_mappings ENABLE ROW LEVEL SECURITY;

-- RLS policies for product_mappings
CREATE POLICY "Users can view their product mappings"
  ON public.product_mappings
  FOR SELECT
  USING (contractor_id = get_user_contractor_id(auth.uid()));

CREATE POLICY "Users can insert product mappings"
  ON public.product_mappings
  FOR INSERT
  WITH CHECK (contractor_id = get_user_contractor_id(auth.uid()));

CREATE POLICY "Users can update their product mappings"
  ON public.product_mappings
  FOR UPDATE
  USING (contractor_id = get_user_contractor_id(auth.uid()));

CREATE POLICY "Users can delete their product mappings"
  ON public.product_mappings
  FOR DELETE
  USING (contractor_id = get_user_contractor_id(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_product_mappings_updated_at
  BEFORE UPDATE ON public.product_mappings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create index for faster lookups
CREATE INDEX idx_product_mappings_contractor_id ON public.product_mappings(contractor_id);
CREATE INDEX idx_product_mappings_trade_bucket ON public.product_mappings(trade_bucket);
CREATE INDEX idx_product_mappings_is_active ON public.product_mappings(is_active);