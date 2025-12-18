-- Create margin_strategies table
CREATE TABLE public.margin_strategies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id uuid REFERENCES public.contractors(id) ON DELETE CASCADE NOT NULL,
  strategy_name text NOT NULL DEFAULT 'Default Strategy',
  base_margin decimal NOT NULL DEFAULT 0.42,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for fast contractor lookups
CREATE INDEX idx_margin_strategies_contractor ON public.margin_strategies(contractor_id);

-- Only one active strategy per contractor
CREATE UNIQUE INDEX idx_margin_strategies_active ON public.margin_strategies(contractor_id) 
WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.margin_strategies ENABLE ROW LEVEL SECURITY;

-- RLS Policies using existing get_user_contractor_id function
CREATE POLICY "Users can view their margin strategies" ON public.margin_strategies
  FOR SELECT USING (contractor_id = get_user_contractor_id(auth.uid()));

CREATE POLICY "Users can insert their margin strategies" ON public.margin_strategies
  FOR INSERT WITH CHECK (contractor_id = get_user_contractor_id(auth.uid()));

CREATE POLICY "Users can update their margin strategies" ON public.margin_strategies
  FOR UPDATE USING (contractor_id = get_user_contractor_id(auth.uid()));

CREATE POLICY "Users can delete their margin strategies" ON public.margin_strategies
  FOR DELETE USING (contractor_id = get_user_contractor_id(auth.uid()));

-- Create zip_margin_rules table
CREATE TABLE public.zip_margin_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id uuid REFERENCES public.margin_strategies(id) ON DELETE CASCADE NOT NULL,
  zip_code text NOT NULL CHECK (zip_code ~ '^\d{5}$'),
  margin_override decimal NOT NULL CHECK (margin_override >= 0 AND margin_override <= 1),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_zip_margin_rules_strategy ON public.zip_margin_rules(strategy_id);
CREATE INDEX idx_zip_margin_rules_zip ON public.zip_margin_rules(zip_code);

-- Prevent duplicate zip codes within same strategy
CREATE UNIQUE INDEX idx_zip_margin_rules_unique ON public.zip_margin_rules(strategy_id, zip_code);

-- Enable RLS
ALTER TABLE public.zip_margin_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Access rules from strategies owned by the user's contractor
CREATE POLICY "Users can view their zip margin rules" ON public.zip_margin_rules
  FOR SELECT USING (strategy_id IN (
    SELECT id FROM public.margin_strategies WHERE contractor_id = get_user_contractor_id(auth.uid())
  ));

CREATE POLICY "Users can insert their zip margin rules" ON public.zip_margin_rules
  FOR INSERT WITH CHECK (strategy_id IN (
    SELECT id FROM public.margin_strategies WHERE contractor_id = get_user_contractor_id(auth.uid())
  ));

CREATE POLICY "Users can update their zip margin rules" ON public.zip_margin_rules
  FOR UPDATE USING (strategy_id IN (
    SELECT id FROM public.margin_strategies WHERE contractor_id = get_user_contractor_id(auth.uid())
  ));

CREATE POLICY "Users can delete their zip margin rules" ON public.zip_margin_rules
  FOR DELETE USING (strategy_id IN (
    SELECT id FROM public.margin_strategies WHERE contractor_id = get_user_contractor_id(auth.uid())
  ));