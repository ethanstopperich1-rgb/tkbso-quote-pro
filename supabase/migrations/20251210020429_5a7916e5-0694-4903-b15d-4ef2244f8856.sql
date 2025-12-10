-- Add material allowance IC fields for tile and cabinets
ALTER TABLE public.pricing_configs 
ADD COLUMN tile_material_allowance_ic numeric DEFAULT 5,
ADD COLUMN cabinet_material_allowance_ic numeric DEFAULT 150;