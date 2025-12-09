-- Add electrical fields
ALTER TABLE public.pricing_configs
ADD COLUMN IF NOT EXISTS outlet_install_ic numeric DEFAULT 35,
ADD COLUMN IF NOT EXISTS outlet_install_cp numeric DEFAULT 65,
ADD COLUMN IF NOT EXISTS switch_install_ic numeric DEFAULT 30,
ADD COLUMN IF NOT EXISTS switch_install_cp numeric DEFAULT 55,
ADD COLUMN IF NOT EXISTS dimmer_upgrade_ic numeric DEFAULT 45,
ADD COLUMN IF NOT EXISTS dimmer_upgrade_cp numeric DEFAULT 85,
ADD COLUMN IF NOT EXISTS new_line_run_ic numeric DEFAULT 250,
ADD COLUMN IF NOT EXISTS new_line_run_cp numeric DEFAULT 450,
ADD COLUMN IF NOT EXISTS dishwasher_circuit_ic numeric DEFAULT 175,
ADD COLUMN IF NOT EXISTS dishwasher_circuit_cp numeric DEFAULT 325,
ADD COLUMN IF NOT EXISTS breaker_install_ic numeric DEFAULT 125,
ADD COLUMN IF NOT EXISTS breaker_install_cp numeric DEFAULT 225,
ADD COLUMN IF NOT EXISTS gfci_install_ic numeric DEFAULT 45,
ADD COLUMN IF NOT EXISTS gfci_install_cp numeric DEFAULT 85,

-- Add flooring/tile fields
ADD COLUMN IF NOT EXISTS wood_look_tile_ic numeric DEFAULT 8,
ADD COLUMN IF NOT EXISTS wood_look_tile_cp numeric DEFAULT 16,
ADD COLUMN IF NOT EXISTS tile_backsplash_ic numeric DEFAULT 25,
ADD COLUMN IF NOT EXISTS tile_backsplash_cp numeric DEFAULT 45,

-- Add allowance fields
ADD COLUMN IF NOT EXISTS laminate_slab_allowance_cp numeric DEFAULT 800,
ADD COLUMN IF NOT EXISTS kitchen_sink_allowance_cp numeric DEFAULT 450,
ADD COLUMN IF NOT EXISTS garbage_disposal_install_cp numeric DEFAULT 250,
ADD COLUMN IF NOT EXISTS led_mirror_allowance_cp numeric DEFAULT 350;