-- Update soffit_demolition unit from 'lf' to 'ea' for all contractors
UPDATE public.trade_buckets_config 
SET unit = 'ea', updated_at = now()
WHERE trade_name IN ('soffit_demolition', 'soffit_removal');

-- Also update the seed function to use 'ea' for new contractors
CREATE OR REPLACE FUNCTION public.seed_trade_buckets_for_contractor(p_contractor_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    (p_contractor_id, 'soffit_demolition', 'Soffit Demolition', 'ea', 150, 0.50, 'Demolition', 'Per soffit removal'),

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
    (p_contractor_id, 'electrical_led_mirror', 'Electrical - LED Mirror', 'ea', 150, 0.40, 'Electrical', 'LED/backlit mirror wiring and install'),
    (p_contractor_id, 'electrical_exhaust_fan', 'Electrical - Exhaust Fan', 'ea', 175, 0.38, 'Electrical', 'Bathroom exhaust fan installation'),

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
    (p_contractor_id, 'quartz_countertop', 'Quartz Countertop', 'sqft', 15, 0.35, 'Countertop', 'Quartz countertop fabrication and install'),

    -- Bathroom Accessories
    (p_contractor_id, 'accessory_towel_bar', 'Towel Bar Install', 'ea', 35, 0.45, 'Accessories', 'Towel bar mounting and installation'),
    (p_contractor_id, 'accessory_towel_ring', 'Towel Ring Install', 'ea', 30, 0.45, 'Accessories', 'Towel ring mounting and installation'),
    (p_contractor_id, 'accessory_tp_holder', 'TP Holder Install', 'ea', 25, 0.45, 'Accessories', 'Toilet paper holder installation'),
    (p_contractor_id, 'accessory_robe_hook', 'Robe Hook Install', 'ea', 25, 0.45, 'Accessories', 'Robe hook mounting and installation'),
    (p_contractor_id, 'accessory_grab_bar', 'Grab Bar Install', 'ea', 85, 0.40, 'Accessories', 'ADA grab bar with structural mounting'),
    (p_contractor_id, 'accessory_shower_shelf', 'Shower Shelf Install', 'ea', 45, 0.45, 'Accessories', 'Shower shelf or corner caddy install'),
    (p_contractor_id, 'accessory_mirror', 'Mirror Install', 'ea', 75, 0.40, 'Accessories', 'Standard vanity mirror mounting'),
    (p_contractor_id, 'accessory_medicine_cabinet', 'Medicine Cabinet Install', 'ea', 125, 0.40, 'Accessories', 'Recessed or surface medicine cabinet'),
    (p_contractor_id, 'accessory_package', 'Accessories Package', 'ea', 150, 0.45, 'Accessories', 'Full accessory package (towel bar, TP holder, robe hooks)')

  ON CONFLICT (contractor_id, trade_name) DO NOTHING;
END;
$function$;