-- Add new vanity sizes (30", 36", 54", 72", 84")
ALTER TABLE public.pricing_configs
ADD COLUMN IF NOT EXISTS vanity_30_bundle_ic numeric DEFAULT 1100,
ADD COLUMN IF NOT EXISTS vanity_30_bundle_cp numeric DEFAULT 1800,
ADD COLUMN IF NOT EXISTS vanity_36_bundle_ic numeric DEFAULT 1300,
ADD COLUMN IF NOT EXISTS vanity_36_bundle_cp numeric DEFAULT 2100,
ADD COLUMN IF NOT EXISTS vanity_54_bundle_ic numeric DEFAULT 1900,
ADD COLUMN IF NOT EXISTS vanity_54_bundle_cp numeric DEFAULT 3000,
ADD COLUMN IF NOT EXISTS vanity_72_bundle_ic numeric DEFAULT 2600,
ADD COLUMN IF NOT EXISTS vanity_72_bundle_cp numeric DEFAULT 4200,
ADD COLUMN IF NOT EXISTS vanity_84_bundle_ic numeric DEFAULT 3200,
ADD COLUMN IF NOT EXISTS vanity_84_bundle_cp numeric DEFAULT 5000;

-- Add new material allowances
ALTER TABLE public.pricing_configs
ADD COLUMN IF NOT EXISTS tub_allowance_cp numeric DEFAULT 800,
ADD COLUMN IF NOT EXISTS shower_trim_kit_allowance_cp numeric DEFAULT 450,
ADD COLUMN IF NOT EXISTS tub_filler_allowance_cp numeric DEFAULT 650,
ADD COLUMN IF NOT EXISTS kitchen_faucet_allowance_cp numeric DEFAULT 400,
ADD COLUMN IF NOT EXISTS garbage_disposal_allowance_cp numeric DEFAULT 250,
ADD COLUMN IF NOT EXISTS freestanding_tub_allowance_cp numeric DEFAULT 2500,
ADD COLUMN IF NOT EXISTS regular_tub_allowance_cp numeric DEFAULT 600;