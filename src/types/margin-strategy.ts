export interface MarginStrategy {
  id: string;
  contractor_id: string;
  strategy_name: string;
  base_margin: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ZipMarginRule {
  id: string;
  strategy_id: string;
  zip_code: string;
  margin_override: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MarginStrategyWithRules extends MarginStrategy {
  zip_margin_rules: ZipMarginRule[];
}

export interface MarginCalculationResult {
  margin_used: number;
  margin_source: string;
  base_margin: number;
  zip_code_applied?: string;
  rule_notes?: string;
}
