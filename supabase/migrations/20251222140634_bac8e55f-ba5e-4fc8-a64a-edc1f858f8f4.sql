-- Add account type and pricing mode columns to contractors table
ALTER TABLE contractors 
ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'gc_contractor' 
  CHECK (account_type IN ('gc_contractor', 'trade_contractor'));

ALTER TABLE contractors
ADD COLUMN IF NOT EXISTS pricing_mode TEXT DEFAULT 'ic_and_cp'
  CHECK (pricing_mode IN ('ic_and_cp', 'cp_only'));

ALTER TABLE contractors
ADD COLUMN IF NOT EXISTS parent_company_id UUID REFERENCES contractors(id);

ALTER TABLE contractors
ADD COLUMN IF NOT EXISTS can_create_subaccounts BOOLEAN DEFAULT false;

-- Create index for parent lookups
CREATE INDEX IF NOT EXISTS idx_contractors_parent ON contractors(parent_company_id);

-- Set all existing contractors to GC mode (default)
UPDATE contractors 
SET 
  account_type = 'gc_contractor',
  pricing_mode = 'ic_and_cp'
WHERE account_type IS NULL;