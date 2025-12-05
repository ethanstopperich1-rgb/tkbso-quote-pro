-- Add Site Prep & General Conditions fields
ALTER TABLE public.pricing_configs
ADD COLUMN IF NOT EXISTS floor_protection_ic numeric DEFAULT 150,
ADD COLUMN IF NOT EXISTS floor_protection_cp numeric DEFAULT 250,
ADD COLUMN IF NOT EXISTS dust_barriers_ic numeric DEFAULT 100,
ADD COLUMN IF NOT EXISTS dust_barriers_cp numeric DEFAULT 200,
ADD COLUMN IF NOT EXISTS post_construction_clean_ic numeric DEFAULT 350,
ADD COLUMN IF NOT EXISTS post_construction_clean_cp numeric DEFAULT 500,
ADD COLUMN IF NOT EXISTS permit_admin_fee_ic numeric DEFAULT 300,
ADD COLUMN IF NOT EXISTS permit_admin_fee_cp numeric DEFAULT 600;

-- Add Mechanicals & Appliances fields
ALTER TABLE public.pricing_configs
ADD COLUMN IF NOT EXISTS hvac_vent_relocate_ic numeric DEFAULT 250,
ADD COLUMN IF NOT EXISTS hvac_vent_relocate_cp numeric DEFAULT 450,
ADD COLUMN IF NOT EXISTS range_hood_ducting_ic numeric DEFAULT 450,
ADD COLUMN IF NOT EXISTS range_hood_ducting_cp numeric DEFAULT 850,
ADD COLUMN IF NOT EXISTS appliance_install_standard_ic numeric DEFAULT 350,
ADD COLUMN IF NOT EXISTS appliance_install_standard_cp numeric DEFAULT 650,
ADD COLUMN IF NOT EXISTS appliance_install_pro_ic numeric DEFAULT 800,
ADD COLUMN IF NOT EXISTS appliance_install_pro_cp numeric DEFAULT 1400;

-- Add Granite & Quartzite slab allowances
ALTER TABLE public.pricing_configs
ADD COLUMN IF NOT EXISTS granite_slab_allowance_cp numeric DEFAULT 1200,
ADD COLUMN IF NOT EXISTS quartzite_slab_allowance_cp numeric DEFAULT 1800;