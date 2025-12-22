import { useAuth } from '@/hooks/useAuth';
import { PricingMode, AccountType } from '@/types/database';

interface PricingModeInfo {
  pricingMode: PricingMode;
  accountType: AccountType;
  showIC: boolean;
  showMargins: boolean;
  isGC: boolean;
  isTrade: boolean;
}

/**
 * Hook to get the current contractor's pricing mode and related display flags.
 * 
 * GC Contractors (ic_and_cp): Show IC, CP, and margins
 * Trade Contractors (cp_only): Show prices only, no IC or margins
 */
export function usePricingMode(): PricingModeInfo {
  const { contractor } = useAuth();
  
  // Default to GC mode if no contractor loaded yet
  const pricingMode: PricingMode = (contractor as any)?.pricing_mode || 'ic_and_cp';
  const accountType: AccountType = (contractor as any)?.account_type || 'gc_contractor';
  
  const isGC = accountType === 'gc_contractor';
  const isTrade = accountType === 'trade_contractor';
  
  // GC contractors see IC and margins, trade contractors do not
  const showIC = pricingMode === 'ic_and_cp';
  const showMargins = pricingMode === 'ic_and_cp';
  
  return {
    pricingMode,
    accountType,
    showIC,
    showMargins,
    isGC,
    isTrade,
  };
}
