-- Add cabinet pricing fields (per linear foot)
ALTER TABLE pricing_configs
ADD COLUMN IF NOT EXISTS cabinet_lf_ic numeric DEFAULT 250,
ADD COLUMN IF NOT EXISTS cabinet_lf_cp numeric DEFAULT 400,
ADD COLUMN IF NOT EXISTS cabinet_install_only_lf_ic numeric DEFAULT 50,
ADD COLUMN IF NOT EXISTS cabinet_install_only_lf_cp numeric DEFAULT 85;