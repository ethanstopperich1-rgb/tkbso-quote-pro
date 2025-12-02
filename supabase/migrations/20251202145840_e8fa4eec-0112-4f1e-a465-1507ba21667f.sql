-- Create trade_buckets_config table for deterministic pricing lookup
CREATE TABLE public.trade_buckets_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contractor_id UUID NOT NULL REFERENCES public.contractors(id) ON DELETE CASCADE,
  trade_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  unit TEXT NOT NULL CHECK (unit IN ('ea', 'sqft', 'lf', 'per_bathroom', 'per_kitchen')),
  ic_per_unit NUMERIC NOT NULL DEFAULT 0,
  margin_percent NUMERIC NOT NULL DEFAULT 0.38,
  category TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(contractor_id, trade_name)
);

-- Enable RLS
ALTER TABLE public.trade_buckets_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their trade buckets config"
  ON public.trade_buckets_config FOR SELECT
  USING (contractor_id = get_user_contractor_id(auth.uid()));

CREATE POLICY "Users can insert their trade buckets config"
  ON public.trade_buckets_config FOR INSERT
  WITH CHECK (contractor_id = get_user_contractor_id(auth.uid()));

CREATE POLICY "Users can update their trade buckets config"
  ON public.trade_buckets_config FOR UPDATE
  USING (contractor_id = get_user_contractor_id(auth.uid()));

CREATE POLICY "Users can delete their trade buckets config"
  ON public.trade_buckets_config FOR DELETE
  USING (contractor_id = get_user_contractor_id(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_trade_buckets_config_updated_at
  BEFORE UPDATE ON public.trade_buckets_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to seed default trade buckets for a contractor
CREATE OR REPLACE FUNCTION public.seed_trade_buckets_for_contractor(p_contractor_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.trade_buckets_config (contractor_id, trade_name, display_name, unit, ic_per_unit, margin_percent, category, description)
  VALUES
    -- Demolition & Haul-Off
    (p_contractor_id, 'demo_shower_only', 'Demo - Shower Only', 'ea', 900, 0.40, 'Demolition', 'Demo shower area only'),
    (p_contractor_id, 'demo_small_bath', 'Demo - Small Bath', 'ea', 1300, 0.40, 'Demolition', 'Demo bathroom under 50 sqft'),
    (p_contractor_id, 'demo_large_bath', 'Demo - Large Bath', 'ea', 1650, 0.40, 'Demolition', 'Demo bathroom 50+ sqft'),
    (p_contractor_id, 'demo_kitchen', 'Demo - Kitchen', 'ea', 1750, 0.40, 'Demolition', 'Demo kitchen'),
    (p_contractor_id, 'dumpster_bath', 'Dumpster/Haul - Bath', 'ea', 400, 0.40, 'Demolition', 'Dumpster and haul-off for bathroom'),
    (p_contractor_id, 'dumpster_kitchen', 'Dumpster/Haul - Kitchen', 'ea', 825, 0.40, 'Demolition', 'Dumpster and haul-off for kitchen'),

    -- Framing & Carpentry
    (p_contractor_id, 'framing_standard', 'Framing - Standard', 'ea', 550, 0.54, 'Framing', 'Standard framing/blocking package'),
    (p_contractor_id, 'framing_niche', 'Framing - Niche', 'ea', 300, 0.54, 'Framing', 'Shower niche framing'),
    (p_contractor_id, 'framing_pony_wall', 'Framing - Pony Wall', 'ea', 450, 0.54, 'Framing', 'Pony wall construction'),

    -- Tile Labor
    (p_contractor_id, 'tile_wall', 'Tile - Wall Labor', 'sqft', 20, 0.47, 'Tile', 'Wall tile installation labor'),
    (p_contractor_id, 'tile_shower_floor', 'Tile - Shower Floor Labor', 'sqft', 6, 0.50, 'Tile', 'Shower floor tile installation'),
    (p_contractor_id, 'tile_main_floor', 'Tile - Main Floor Labor', 'sqft', 5.5, 0.38, 'Tile', 'Main floor tile installation'),

    -- Support Work
    (p_contractor_id, 'waterproofing', 'Waterproofing', 'sqft', 6, 0.44, 'Support', 'Waterproofing membrane'),
    (p_contractor_id, 'cement_board', 'Cement Board', 'sqft', 3, 0.40, 'Support', 'Cement board installation'),
    (p_contractor_id, 'floor_leveling', 'Floor Leveling', 'ea', 500, 0.40, 'Support', 'Floor leveling compound'),

    -- Plumbing
    (p_contractor_id, 'plumbing_shower_standard', 'Plumbing - Standard Shower', 'ea', 2225, 0.52, 'Plumbing', 'Standard shower rough-in'),
    (p_contractor_id, 'plumbing_extra_head', 'Plumbing - Extra Head', 'ea', 625, 0.52, 'Plumbing', 'Additional shower head/diverter'),
    (p_contractor_id, 'plumbing_toilet', 'Plumbing - Toilet Swap', 'ea', 350, 0.52, 'Plumbing', 'Toilet removal and install'),
    (p_contractor_id, 'plumbing_tub_to_shower', 'Plumbing - Tub to Shower', 'ea', 2550, 0.39, 'Plumbing', 'Tub to shower conversion'),
    (p_contractor_id, 'plumbing_freestanding_tub', 'Plumbing - Freestanding Tub', 'ea', 3300, 0.52, 'Plumbing', 'Freestanding tub installation'),
    (p_contractor_id, 'plumbing_linear_drain', 'Plumbing - Linear Drain', 'ea', 750, 0.52, 'Plumbing', 'Linear drain installation'),
    (p_contractor_id, 'plumbing_smart_valve', 'Plumbing - Smart Valve', 'ea', 1350, 0.52, 'Plumbing', 'Smart shower valve system'),

    -- Electrical
    (p_contractor_id, 'electrical_recessed_can', 'Electrical - Recessed Can', 'ea', 65, 0.38, 'Electrical', 'Recessed light installation'),
    (p_contractor_id, 'electrical_vanity_light', 'Electrical - Vanity Light', 'ea', 200, 0.38, 'Electrical', 'Vanity light installation'),
    (p_contractor_id, 'electrical_small_package', 'Electrical - Small Package', 'ea', 250, 0.38, 'Electrical', 'Small electrical package'),
    (p_contractor_id, 'electrical_kitchen_package', 'Electrical - Kitchen Package', 'ea', 950, 0.38, 'Electrical', 'Kitchen electrical package'),

    -- Paint
    (p_contractor_id, 'paint_patch', 'Paint - Patch & Touch-up', 'ea', 800, 0.38, 'Paint', 'Drywall patch and touch-up'),
    (p_contractor_id, 'paint_full_bath', 'Paint - Full Bath', 'ea', 1200, 0.38, 'Paint', 'Full bathroom paint'),

    -- Glass
    (p_contractor_id, 'glass_shower_standard', 'Glass - Shower Standard', 'ea', 1200, 0.43, 'Glass', 'Standard shower door and panel'),
    (p_contractor_id, 'glass_panel_only', 'Glass - Panel Only', 'ea', 800, 0.43, 'Glass', 'Glass panel only'),
    (p_contractor_id, 'glass_90_return', 'Glass - 90° Return', 'ea', 1425, 0.43, 'Glass', '90 degree glass return'),

    -- Vanities
    (p_contractor_id, 'vanity_30', 'Vanity - 30"', 'ea', 1100, 0.38, 'Vanity', '30" vanity bundle with top'),
    (p_contractor_id, 'vanity_36', 'Vanity - 36"', 'ea', 1300, 0.38, 'Vanity', '36" vanity bundle with top'),
    (p_contractor_id, 'vanity_48', 'Vanity - 48"', 'ea', 1600, 0.38, 'Vanity', '48" vanity bundle with top'),
    (p_contractor_id, 'vanity_54', 'Vanity - 54"', 'ea', 1900, 0.38, 'Vanity', '54" vanity bundle with top'),
    (p_contractor_id, 'vanity_60', 'Vanity - 60"', 'ea', 2200, 0.38, 'Vanity', '60" double vanity bundle'),
    (p_contractor_id, 'vanity_72', 'Vanity - 72"', 'ea', 2600, 0.38, 'Vanity', '72" double vanity bundle'),
    (p_contractor_id, 'vanity_84', 'Vanity - 84"', 'ea', 3200, 0.38, 'Vanity', '84" double vanity bundle'),

    -- Countertops
    (p_contractor_id, 'quartz_countertop', 'Quartz Countertop', 'sqft', 15, 0.35, 'Countertop', 'Quartz countertop fabrication and install')

  ON CONFLICT (contractor_id, trade_name) DO NOTHING;
END;
$$;

-- Create trigger to auto-seed trade buckets when a new contractor is created
CREATE OR REPLACE FUNCTION public.auto_seed_trade_buckets()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.seed_trade_buckets_for_contractor(NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER seed_trade_buckets_on_contractor_insert
  AFTER INSERT ON public.contractors
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_seed_trade_buckets();

-- Seed existing contractors
DO $$
DECLARE
  contractor_record RECORD;
BEGIN
  FOR contractor_record IN SELECT id FROM public.contractors LOOP
    PERFORM public.seed_trade_buckets_for_contractor(contractor_record.id);
  END LOOP;
END;
$$;