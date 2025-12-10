-- Add quartz material allowance IC field
ALTER TABLE public.pricing_configs 
ADD COLUMN quartz_material_allowance_ic numeric DEFAULT 25;