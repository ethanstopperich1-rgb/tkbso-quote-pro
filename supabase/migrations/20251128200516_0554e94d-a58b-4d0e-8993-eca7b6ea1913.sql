
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'contractor_user');

-- 1. CONTRACTORS TABLE
CREATE TABLE public.contractors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  primary_contact_name TEXT,
  primary_contact_email TEXT,
  primary_contact_phone TEXT,
  service_area TEXT,
  logo_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PROFILES TABLE
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  contractor_id UUID REFERENCES public.contractors(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. USER_ROLES TABLE (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'contractor_user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- 4. PRICING_CONFIGS TABLE
CREATE TABLE public.pricing_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contractor_id UUID REFERENCES public.contractors(id) ON DELETE CASCADE NOT NULL UNIQUE,
  currency TEXT DEFAULT 'USD',
  
  -- Kitchen per-sqft
  kitchen_ic_per_sqft NUMERIC DEFAULT 120,
  kitchen_cp_per_sqft NUMERIC DEFAULT 185,
  kitchen_partial_multiplier NUMERIC DEFAULT 0.60,
  kitchen_refresh_multiplier NUMERIC DEFAULT 0.40,
  
  -- Bath per-sqft
  bath_ic_per_sqft NUMERIC DEFAULT 240,
  bath_cp_per_sqft NUMERIC DEFAULT 370,
  bath_shower_only_multiplier NUMERIC DEFAULT 0.60,
  bath_partial_multiplier NUMERIC DEFAULT 0.75,
  bath_refresh_multiplier NUMERIC DEFAULT 0.50,
  
  -- Closet per-sqft
  closet_ic_per_sqft NUMERIC DEFAULT 45,
  closet_cp_per_sqft NUMERIC DEFAULT 75,
  
  -- Tile labor
  tile_wall_ic_per_sqft NUMERIC DEFAULT 21,
  tile_wall_cp_per_sqft NUMERIC DEFAULT 35,
  tile_floor_ic_per_sqft NUMERIC DEFAULT 4.5,
  tile_floor_cp_per_sqft NUMERIC DEFAULT 8,
  tile_shower_floor_ic_per_sqft NUMERIC DEFAULT 5,
  tile_shower_floor_cp_per_sqft NUMERIC DEFAULT 9,
  
  -- Cement board
  cement_board_ic_per_sqft NUMERIC DEFAULT 3,
  cement_board_cp_per_sqft NUMERIC DEFAULT 5,
  
  -- Quartz
  quartz_ic_per_sqft NUMERIC DEFAULT 15,
  quartz_cp_per_sqft NUMERIC DEFAULT 28,
  
  -- Lighting
  recessed_can_ic_each NUMERIC DEFAULT 65,
  recessed_can_cp_each NUMERIC DEFAULT 110,
  
  -- Glass
  frameless_glass_ic_per_sqft NUMERIC DEFAULT 45,
  frameless_glass_cp_per_sqft NUMERIC DEFAULT 75,
  
  -- GC/Permits
  gc_permit_fee_ic NUMERIC DEFAULT 2500,
  gc_permit_fee_cp NUMERIC DEFAULT 2500,
  
  -- Cabinet markups
  cabinet_markup_multiplier_no_gc NUMERIC DEFAULT 1.28,
  cabinet_markup_multiplier_with_gc NUMERIC DEFAULT 1.15,
  
  -- Minimums
  min_job_ic NUMERIC DEFAULT 3000,
  min_job_cp NUMERIC DEFAULT 5000,
  
  -- Margins
  target_margin NUMERIC DEFAULT 0.38,
  low_range_multiplier NUMERIC DEFAULT 0.95,
  high_range_multiplier NUMERIC DEFAULT 1.05,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ESTIMATES TABLE
CREATE TABLE public.estimates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contractor_id UUID REFERENCES public.contractors(id) ON DELETE CASCADE NOT NULL,
  created_by_profile_id UUID REFERENCES public.profiles(id),
  
  -- Job info
  job_label TEXT,
  client_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  property_address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  
  -- High-level flags
  has_kitchen BOOLEAN DEFAULT FALSE,
  has_bathrooms BOOLEAN DEFAULT FALSE,
  has_closets BOOLEAN DEFAULT FALSE,
  
  -- Kitchen fields
  total_kitchen_sqft NUMERIC DEFAULT 0,
  num_kitchens INTEGER DEFAULT 0,
  kitchen_scope_level TEXT DEFAULT 'none',
  kitchen_countertop_sqft NUMERIC DEFAULT 0,
  kitchen_uses_tkbso_cabinets BOOLEAN DEFAULT FALSE,
  kitchen_cabinet_supplier_cost_ic NUMERIC DEFAULT 0,
  
  -- Bathroom fields
  total_bathroom_sqft NUMERIC DEFAULT 0,
  num_bathrooms INTEGER DEFAULT 0,
  bath_scope_level TEXT DEFAULT 'none',
  bath_shower_only_sqft NUMERIC DEFAULT 0,
  bath_wall_tile_sqft NUMERIC DEFAULT 0,
  bath_floor_tile_sqft NUMERIC DEFAULT 0,
  bath_shower_floor_tile_sqft NUMERIC DEFAULT 0,
  bath_countertop_sqft NUMERIC DEFAULT 0,
  bath_uses_tkbso_vanities BOOLEAN DEFAULT FALSE,
  bath_vanity_supplier_cost_ic NUMERIC DEFAULT 0,
  bath_uses_frameless_glass BOOLEAN DEFAULT FALSE,
  bath_frameless_glass_sqft NUMERIC DEFAULT 0,
  
  -- Closet fields
  total_closet_sqft NUMERIC DEFAULT 0,
  num_closets INTEGER DEFAULT 0,
  closet_scope_level TEXT DEFAULT 'none',
  
  -- Electrical
  num_recessed_cans INTEGER DEFAULT 0,
  
  -- Global
  needs_gc_partner BOOLEAN DEFAULT FALSE,
  permit_required BOOLEAN DEFAULT FALSE,
  job_notes TEXT,
  
  -- IC totals
  kitchen_ic_total NUMERIC DEFAULT 0,
  baths_ic_total NUMERIC DEFAULT 0,
  closets_ic_total NUMERIC DEFAULT 0,
  tile_ic_total NUMERIC DEFAULT 0,
  cement_board_ic_total NUMERIC DEFAULT 0,
  quartz_ic_total NUMERIC DEFAULT 0,
  cabinets_ic_total NUMERIC DEFAULT 0,
  vanities_ic_total NUMERIC DEFAULT 0,
  glass_ic_total NUMERIC DEFAULT 0,
  lighting_ic_total NUMERIC DEFAULT 0,
  gc_permit_ic_total NUMERIC DEFAULT 0,
  other_ic_total NUMERIC DEFAULT 0,
  subtotal_ic_before_min_job NUMERIC DEFAULT 0,
  final_ic_total NUMERIC DEFAULT 0,
  
  -- CP totals
  kitchen_cp_total NUMERIC DEFAULT 0,
  baths_cp_total NUMERIC DEFAULT 0,
  closets_cp_total NUMERIC DEFAULT 0,
  tile_cp_total NUMERIC DEFAULT 0,
  cement_board_cp_total NUMERIC DEFAULT 0,
  quartz_cp_total NUMERIC DEFAULT 0,
  cabinets_cp_total NUMERIC DEFAULT 0,
  vanities_cp_total NUMERIC DEFAULT 0,
  glass_cp_total NUMERIC DEFAULT 0,
  lighting_cp_total NUMERIC DEFAULT 0,
  gc_permit_cp_total NUMERIC DEFAULT 0,
  other_cp_total NUMERIC DEFAULT 0,
  subtotal_cp_before_min_job NUMERIC DEFAULT 0,
  final_cp_total NUMERIC DEFAULT 0,
  low_estimate_cp NUMERIC DEFAULT 0,
  high_estimate_cp NUMERIC DEFAULT 0,
  
  -- AI/presentation
  client_estimate_text TEXT,
  internal_json_payload JSONB,
  status TEXT DEFAULT 'draft',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CHAT_SESSIONS TABLE
CREATE TABLE public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contractor_id UUID REFERENCES public.contractors(id) ON DELETE CASCADE NOT NULL,
  created_by_profile_id UUID REFERENCES public.profiles(id),
  job_label TEXT,
  status TEXT DEFAULT 'in_progress',
  current_job_state JSONB DEFAULT '{}'::jsonb,
  linked_estimate_id UUID REFERENCES public.estimates(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. CHAT_MESSAGES TABLE
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE NOT NULL,
  sender_type TEXT NOT NULL,
  sender_profile_id UUID REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  role TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER set_updated_at_contractors BEFORE UPDATE ON public.contractors FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_pricing_configs BEFORE UPDATE ON public.pricing_configs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_estimates BEFORE UPDATE ON public.estimates FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_chat_sessions BEFORE UPDATE ON public.chat_sessions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS on all tables
ALTER TABLE public.contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Security definer function to get user's contractor_id
CREATE OR REPLACE FUNCTION public.get_user_contractor_id(user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT contractor_id FROM public.profiles WHERE id = user_id
$$;

-- Security definer function to check role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- PROFILES RLS
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- USER_ROLES RLS
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- CONTRACTORS RLS
CREATE POLICY "Users can view their contractor" ON public.contractors FOR SELECT 
  USING (id = public.get_user_contractor_id(auth.uid()));
CREATE POLICY "Users can update their contractor" ON public.contractors FOR UPDATE 
  USING (id = public.get_user_contractor_id(auth.uid()));

-- PRICING_CONFIGS RLS
CREATE POLICY "Users can view their pricing config" ON public.pricing_configs FOR SELECT 
  USING (contractor_id = public.get_user_contractor_id(auth.uid()));
CREATE POLICY "Users can update their pricing config" ON public.pricing_configs FOR UPDATE 
  USING (contractor_id = public.get_user_contractor_id(auth.uid()));
CREATE POLICY "Users can insert pricing config" ON public.pricing_configs FOR INSERT 
  WITH CHECK (contractor_id = public.get_user_contractor_id(auth.uid()));

-- ESTIMATES RLS
CREATE POLICY "Users can view their estimates" ON public.estimates FOR SELECT 
  USING (contractor_id = public.get_user_contractor_id(auth.uid()));
CREATE POLICY "Users can insert estimates" ON public.estimates FOR INSERT 
  WITH CHECK (contractor_id = public.get_user_contractor_id(auth.uid()));
CREATE POLICY "Users can update their estimates" ON public.estimates FOR UPDATE 
  USING (contractor_id = public.get_user_contractor_id(auth.uid()));
CREATE POLICY "Users can delete their estimates" ON public.estimates FOR DELETE 
  USING (contractor_id = public.get_user_contractor_id(auth.uid()));

-- CHAT_SESSIONS RLS
CREATE POLICY "Users can view their chat sessions" ON public.chat_sessions FOR SELECT 
  USING (contractor_id = public.get_user_contractor_id(auth.uid()));
CREATE POLICY "Users can insert chat sessions" ON public.chat_sessions FOR INSERT 
  WITH CHECK (contractor_id = public.get_user_contractor_id(auth.uid()));
CREATE POLICY "Users can update their chat sessions" ON public.chat_sessions FOR UPDATE 
  USING (contractor_id = public.get_user_contractor_id(auth.uid()));

-- CHAT_MESSAGES RLS (via chat_session's contractor_id)
CREATE POLICY "Users can view their chat messages" ON public.chat_messages FOR SELECT 
  USING (
    chat_session_id IN (
      SELECT id FROM public.chat_sessions 
      WHERE contractor_id = public.get_user_contractor_id(auth.uid())
    )
  );
CREATE POLICY "Users can insert chat messages" ON public.chat_messages FOR INSERT 
  WITH CHECK (
    chat_session_id IN (
      SELECT id FROM public.chat_sessions 
      WHERE contractor_id = public.get_user_contractor_id(auth.uid())
    )
  );

-- Function to handle new user signup - creates contractor + profile + pricing_config
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_contractor_id UUID;
BEGIN
  -- Create a new contractor for this user
  INSERT INTO public.contractors (name, primary_contact_email)
  VALUES ('My Company', NEW.email)
  RETURNING id INTO new_contractor_id;
  
  -- Create the profile linked to the contractor
  INSERT INTO public.profiles (id, contractor_id, email, name)
  VALUES (NEW.id, new_contractor_id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', ''));
  
  -- Create default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'contractor_user');
  
  -- Create default pricing config with TKBSO-style defaults
  INSERT INTO public.pricing_configs (contractor_id)
  VALUES (new_contractor_id);
  
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
