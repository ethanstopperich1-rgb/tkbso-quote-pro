import { supabase } from '@/integrations/supabase/client';
import { MarginCalculationResult } from '@/types/margin-strategy';

/**
 * Extract zip code from address string
 */
export function extractZipCode(address: string): string | null {
  // Match 5-digit zip codes
  const zipMatch = address.match(/\b\d{5}\b/);
  return zipMatch ? zipMatch[0] : null;
}

/**
 * Get the appropriate margin for a contractor and zip code
 */
export async function getMarginForZipCode(
  contractorId: string,
  zipCode: string | null
): Promise<MarginCalculationResult> {
  try {
    // Get active strategy with its rules
    const { data: strategy, error: strategyError } = await supabase
      .from('margin_strategies')
      .select('*, zip_margin_rules(*)')
      .eq('contractor_id', contractorId)
      .eq('is_active', true)
      .maybeSingle();

    if (strategyError) {
      console.error('Error fetching margin strategy:', strategyError);
      // Default to 42% if error
      return {
        margin_used: 0.42,
        margin_source: 'Default (42%)',
        base_margin: 0.42
      };
    }

    if (!strategy) {
      // Default to 42% if no strategy exists
      return {
        margin_used: 0.42,
        margin_source: 'Default (42%)',
        base_margin: 0.42
      };
    }

    // If no zip code provided, use base margin
    if (!zipCode) {
      return {
        margin_used: strategy.base_margin,
        margin_source: 'Base margin',
        base_margin: strategy.base_margin
      };
    }

    // Check for zip-specific override
    const zipRules = (strategy as any).zip_margin_rules || [];
    const zipRule = zipRules.find(
      (rule: any) => rule.zip_code === zipCode
    );

    if (zipRule) {
      return {
        margin_used: zipRule.margin_override,
        margin_source: `${zipCode} override`,
        base_margin: strategy.base_margin,
        zip_code_applied: zipCode,
        rule_notes: zipRule.notes || undefined
      };
    }

    // No override found, use base margin
    return {
      margin_used: strategy.base_margin,
      margin_source: 'Base margin (no override for this zip)',
      base_margin: strategy.base_margin
    };

  } catch (error) {
    console.error('Error getting margin:', error);
    // Fallback to default
    return {
      margin_used: 0.42,
      margin_source: 'Default (error occurred)',
      base_margin: 0.42
    };
  }
}

/**
 * Calculate customer price with margin applied
 */
export function calculateCustomerPrice(
  internalCost: number,
  margin: number
): number {
  return internalCost * (1 + margin);
}
