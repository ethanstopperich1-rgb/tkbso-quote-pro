import { useState, useCallback } from 'react';
import { 
  getProjectDefaults, 
  ProjectDefaults, 
  TradeDefault, 
  TypicalItem, 
  LaborRate,
  BATHROOM_DEFAULTS,
  KITCHEN_DEFAULTS 
} from '@/lib/project-defaults';

export interface LoadedDefaults {
  projectType: 'bathroom' | 'kitchen';
  defaults: ProjectDefaults;
  isLoaded: boolean;
}

export interface ScopeItem {
  key: string;
  name: string;
  quantity: number;
  unit: string;
  icPerUnit: number;
  cpPerUnit: number;
  icTotal: number;
  cpTotal: number;
  allowance?: number;
  allowancePerUnit?: number;
  tradeId: string;
}

export function useProjectDefaults() {
  const [loadedDefaults, setLoadedDefaults] = useState<LoadedDefaults | null>(null);
  const [baselineScope, setBaselineScope] = useState<ScopeItem[]>([]);

  /**
   * Load project defaults when user selects project type.
   * This provides the baseline scope with typical line items and allowances.
   */
  const loadDefaults = useCallback((projectType: 'bathroom' | 'kitchen') => {
    const defaults = getProjectDefaults(projectType);
    
    setLoadedDefaults({
      projectType,
      defaults,
      isLoaded: true,
    });

    // Build baseline scope from defaults
    const scope: ScopeItem[] = [];
    
    for (const trade of defaults.trades) {
      // Add typical items with allowances
      for (const item of trade.typicalItems) {
        if (item.defaultAllowance || item.defaultAllowancePerUnit) {
          scope.push({
            key: item.key,
            name: item.name,
            quantity: item.defaultQuantity || 1,
            unit: item.unit || 'ea',
            icPerUnit: 0, // Allowances are CP-only
            cpPerUnit: item.defaultAllowancePerUnit || 0,
            icTotal: 0,
            cpTotal: item.defaultAllowance || 0,
            allowance: item.defaultAllowance,
            allowancePerUnit: item.defaultAllowancePerUnit,
            tradeId: trade.tradeId,
          });
        }
      }
    }

    setBaselineScope(scope);
    
    console.log(`Loaded ${projectType} defaults with ${scope.length} baseline items`);
    
    return defaults;
  }, []);

  /**
   * Get labor rate for a specific item key
   */
  const getLaborRate = useCallback((key: string): LaborRate | undefined => {
    if (!loadedDefaults) return undefined;
    
    for (const trade of loadedDefaults.defaults.trades) {
      const rate = trade.laborRates.find(r => r.key === key);
      if (rate) return rate;
    }
    return undefined;
  }, [loadedDefaults]);

  /**
   * Get typical item allowance for a specific key
   */
  const getTypicalItem = useCallback((key: string): TypicalItem | undefined => {
    if (!loadedDefaults) return undefined;
    
    for (const trade of loadedDefaults.defaults.trades) {
      const item = trade.typicalItems.find(i => i.key === key);
      if (item) return item;
    }
    return undefined;
  }, [loadedDefaults]);

  /**
   * Get all labor rates for a trade
   */
  const getTradeRates = useCallback((tradeId: string): LaborRate[] => {
    if (!loadedDefaults) return [];
    
    const trade = loadedDefaults.defaults.trades.find(t => t.tradeId === tradeId);
    return trade?.laborRates || [];
  }, [loadedDefaults]);

  /**
   * Calculate line item total from quantity and rate
   */
  const calculateLineItem = useCallback((key: string, quantity: number): { ic: number; cp: number } | undefined => {
    const rate = getLaborRate(key);
    if (!rate) return undefined;
    
    return {
      ic: rate.icPerUnit * quantity,
      cp: rate.cpPerUnit * quantity,
    };
  }, [getLaborRate]);

  /**
   * Get default markup multiplier
   */
  const getMarkup = useCallback((): number => {
    return loadedDefaults?.defaults.defaultMarkup || 1.4;
  }, [loadedDefaults]);

  /**
   * Reset to initial state
   */
  const reset = useCallback(() => {
    setLoadedDefaults(null);
    setBaselineScope([]);
  }, []);

  return {
    loadedDefaults,
    baselineScope,
    loadDefaults,
    getLaborRate,
    getTypicalItem,
    getTradeRates,
    calculateLineItem,
    getMarkup,
    reset,
    // Expose raw defaults for direct access
    bathroomDefaults: BATHROOM_DEFAULTS,
    kitchenDefaults: KITCHEN_DEFAULTS,
  };
}
