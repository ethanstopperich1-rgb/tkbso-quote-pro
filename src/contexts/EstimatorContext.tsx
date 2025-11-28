import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Quote, ClientInfo } from '@/types/estimator';
import { PRICING, calculateBathroomRange, calculateKitchenRange, calculateMargin, formatCurrency } from '@/lib/pricing';

export type ScopeLevel = 'full_gut' | 'partial' | 'shower_only' | 'refresh';
export type WorkflowStage = 'collecting' | 'confirming' | 'client_details' | 'generating' | 'complete';

export interface RoomData {
  id: string;
  type: 'kitchen' | 'bathroom' | 'closet';
  name: string;
  sqft: number;
  scopeLevel: ScopeLevel;
  tileWallSqft?: number;
  tileFloorSqft?: number;
  showerFloorSqft?: number;
  countertopSqft?: number;
}

export interface TradeSelection {
  includeCabinetry: boolean;
  cabinetrySupplier: 'tkbso' | 'customer';
  includeCountertops: boolean;
  includeGlass: boolean;
  glassType: 'frameless' | 'framed' | 'none';
  glassSqft: number;
  includePlumbing: boolean;
  includeElectrical: boolean;
  recessedCans: number;
  includePainting: boolean;
  includeTile: boolean;
}

export type PricingMode = 'auto' | 'sell_price' | 'target_margin';

// Standard TKBSO margins by project type
export const TKBSO_MARGINS = {
  bathroom: { target: 0.38, range: { low: 0.35, high: 0.42 } },
  kitchen: { target: 0.35, range: { low: 0.32, high: 0.40 } },
  closet: { target: 0.32, range: { low: 0.28, high: 0.35 } },
  combination: { target: 0.36, range: { low: 0.33, high: 0.40 } },
};

export interface ProjectState {
  // Workflow
  stage: WorkflowStage;
  
  // Project basics
  projectType: 'kitchen' | 'bathroom' | 'closet' | 'combination' | null;
  location: string;
  hasGC: boolean;
  needsPermit: boolean;
  qualityLevel: 'basic' | 'mid-range' | 'high-end';
  
  // Rooms
  rooms: RoomData[];
  
  // Trade selections
  trades: TradeSelection;
  
  // Client info
  clientInfo: Partial<ClientInfo>;
  
  // Pricing overrides (3 modes)
  pricingMode: PricingMode;
  overrideValue: number | null; // Price in dollars or margin as decimal (0.40 = 40%)
  
  // Calculated values (IC stays constant, CP changes based on mode)
  baseInternalCost: number; // Raw IC before any overrides
  internalCost: number;
  recommendedPrice: number;
  lowEstimate: number;
  highEstimate: number;
  calculatedMargin: number;
  profit: number;
  
  // Lock status
  isLocked: boolean;
  lockedAt: Date | null;
  
  // Generated quote
  finalQuote: Quote | null;
}

const defaultTrades: TradeSelection = {
  includeCabinetry: true,
  cabinetrySupplier: 'tkbso',
  includeCountertops: true,
  includeGlass: false,
  glassType: 'none',
  glassSqft: 0,
  includePlumbing: true,
  includeElectrical: true,
  recessedCans: 0,
  includePainting: true,
  includeTile: true,
};

const initialState: ProjectState = {
  stage: 'collecting',
  projectType: null,
  location: '',
  hasGC: false,
  needsPermit: false,
  qualityLevel: 'mid-range',
  rooms: [],
  trades: { ...defaultTrades },
  clientInfo: {},
  pricingMode: 'auto',
  overrideValue: null,
  baseInternalCost: 0,
  internalCost: 0,
  recommendedPrice: 0,
  lowEstimate: 0,
  highEstimate: 0,
  calculatedMargin: 0,
  profit: 0,
  isLocked: false,
  lockedAt: null,
  finalQuote: null,
};

interface EstimatorContextType {
  state: ProjectState;
  
  // Stage management
  setStage: (stage: WorkflowStage) => void;
  canProceed: () => boolean;
  
  // Project updates
  setProjectType: (type: ProjectState['projectType']) => void;
  setLocation: (location: string) => void;
  setHasGC: (hasGC: boolean) => void;
  setNeedsPermit: (needsPermit: boolean) => void;
  setQualityLevel: (level: ProjectState['qualityLevel']) => void;
  
  // Room management
  addRoom: (room: Omit<RoomData, 'id'>) => void;
  updateRoom: (id: string, updates: Partial<RoomData>) => void;
  removeRoom: (id: string) => void;
  
  // Trade selections
  updateTrades: (updates: Partial<TradeSelection>) => void;
  
  // Client info
  updateClientInfo: (updates: Partial<ClientInfo>) => void;
  
  // Pricing overrides
  setPricingMode: (mode: PricingMode) => void;
  setSellingPrice: (price: number) => void;
  setTargetMargin: (margin: number) => void;
  resetToAutoMargin: () => void;
  lockEstimate: () => void;
  
  // Quote generation
  generateQuote: () => Quote;
  setFinalQuote: (quote: Quote) => void;
  
  // Reset
  reset: () => void;
  
  // Helpers
  getTotalSqft: () => number;
  hasValidInputs: () => boolean;
  hasCompleteClientInfo: () => boolean;
}

const EstimatorContext = createContext<EstimatorContextType | undefined>(undefined);

export function EstimatorProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProjectState>(initialState);
  
  // Calculate prices whenever relevant state changes
  const recalculatePrices = useCallback((newState: ProjectState): ProjectState => {
    let totalIC = 0;
    let totalCP = 0;
    
    // Scope multipliers
    const scopeMultipliers = {
      full_gut: 1,
      partial: 0.75,
      shower_only: 0.6,
      refresh: 0.5,
    };
    
    const defaultMargin = PRICING.markups.targetMargin;
    
    // Calculate room-based pricing
    newState.rooms.forEach(room => {
      if (room.type === 'bathroom') {
        const multiplier = scopeMultipliers[room.scopeLevel] || 1;
        const { low, high } = calculateBathroomRange(room.sqft);
        const mid = (low + high) / 2;
        totalCP += mid * multiplier;
        totalIC += mid * (1 - defaultMargin) * multiplier;
      } else if (room.type === 'kitchen') {
        const multiplier = room.scopeLevel === 'full_gut' ? 1 :
          room.scopeLevel === 'partial' ? 0.6 :
          room.scopeLevel === 'refresh' ? 0.4 : 1;
        
        const { low, high } = calculateKitchenRange(room.sqft);
        const mid = (low + high) / 2;
        totalCP += mid * multiplier;
        totalIC += mid * (1 - defaultMargin) * multiplier;
      } else if (room.type === 'closet') {
        const closetRate = (PRICING.perSqFt.closet.low + PRICING.perSqFt.closet.high) / 2;
        totalCP += room.sqft * closetRate;
        totalIC += room.sqft * closetRate * 0.6;
      }
    });
    
    // Add trade-specific costs
    const glassRate = 75; // per sq ft for frameless glass
    if (newState.trades.includeGlass && newState.trades.glassType === 'frameless') {
      totalCP += newState.trades.glassSqft * glassRate;
      totalIC += newState.trades.glassSqft * glassRate * 0.6;
    }
    
    if (newState.trades.includeElectrical && newState.trades.recessedCans > 0) {
      totalCP += newState.trades.recessedCans * 110;
      totalIC += newState.trades.recessedCans * 65;
    }
    
    // GC/Permit fees
    if (newState.hasGC && newState.needsPermit) {
      totalCP += 2500;
      totalIC += 2500;
    }
    
    // Apply minimums to base costs
    totalIC = Math.max(totalIC, 3000);
    const baseIC = Math.round(totalIC);
    
    // Apply pricing mode
    let finalCP: number;
    let finalMargin: number;
    
    const projectType = newState.projectType || 'bathroom';
    const tkbsoMargin = TKBSO_MARGINS[projectType]?.target || 0.38;
    
    switch (newState.pricingMode) {
      case 'sell_price':
        // Mode 1: Contractor sets selling price, margin calculated backwards
        if (newState.overrideValue && newState.overrideValue > 0) {
          finalCP = newState.overrideValue;
          finalMargin = baseIC > 0 ? 1 - (baseIC / finalCP) : 0;
        } else {
          finalCP = Math.round(baseIC / (1 - tkbsoMargin));
          finalMargin = tkbsoMargin;
        }
        break;
        
      case 'target_margin':
        // Mode 2: Contractor sets margin, price calculated
        if (newState.overrideValue && newState.overrideValue > 0 && newState.overrideValue < 1) {
          finalMargin = newState.overrideValue;
          finalCP = Math.round(baseIC / (1 - finalMargin));
        } else {
          finalMargin = tkbsoMargin;
          finalCP = Math.round(baseIC / (1 - finalMargin));
        }
        break;
        
      case 'auto':
      default:
        // Mode 3: Standard TKBSO auto-margin
        finalMargin = tkbsoMargin;
        finalCP = Math.round(baseIC / (1 - finalMargin));
        break;
    }
    
    // Apply minimum CP
    finalCP = Math.max(finalCP, 5000);
    
    // Recalculate margin if minimum was applied
    if (finalCP === 5000 && baseIC < 5000) {
      finalMargin = 1 - (baseIC / finalCP);
    }
    
    const profit = finalCP - baseIC;
    
    return {
      ...newState,
      baseInternalCost: baseIC,
      internalCost: baseIC,
      recommendedPrice: Math.round(finalCP),
      lowEstimate: Math.round(finalCP * 0.95),
      highEstimate: Math.round(finalCP * 1.05),
      calculatedMargin: finalMargin,
      profit: Math.round(profit),
    };
  }, []);
  
  const setStage = useCallback((stage: WorkflowStage) => {
    setState(prev => ({ ...prev, stage }));
  }, []);
  
  const canProceed = useCallback(() => {
    const { stage, rooms, clientInfo } = state;
    
    if (stage === 'collecting') {
      return state.projectType !== null && rooms.length > 0 && rooms.some(r => r.sqft > 0);
    }
    if (stage === 'confirming') {
      return true; // User can always confirm
    }
    if (stage === 'client_details') {
      return !!(clientInfo.name && clientInfo.address && clientInfo.city && clientInfo.state);
    }
    return true;
  }, [state]);
  
  const setProjectType = useCallback((type: ProjectState['projectType']) => {
    setState(prev => recalculatePrices({ ...prev, projectType: type }));
  }, [recalculatePrices]);
  
  const setLocation = useCallback((location: string) => {
    setState(prev => ({ ...prev, location }));
  }, []);
  
  const setHasGC = useCallback((hasGC: boolean) => {
    setState(prev => recalculatePrices({ ...prev, hasGC }));
  }, [recalculatePrices]);
  
  const setNeedsPermit = useCallback((needsPermit: boolean) => {
    setState(prev => recalculatePrices({ ...prev, needsPermit }));
  }, [recalculatePrices]);
  
  const setQualityLevel = useCallback((qualityLevel: ProjectState['qualityLevel']) => {
    setState(prev => recalculatePrices({ ...prev, qualityLevel }));
  }, [recalculatePrices]);
  
  const addRoom = useCallback((room: Omit<RoomData, 'id'>) => {
    const newRoom: RoomData = { ...room, id: Date.now().toString() };
    setState(prev => recalculatePrices({ ...prev, rooms: [...prev.rooms, newRoom] }));
  }, [recalculatePrices]);
  
  const updateRoom = useCallback((id: string, updates: Partial<RoomData>) => {
    setState(prev => {
      const rooms = prev.rooms.map(r => r.id === id ? { ...r, ...updates } : r);
      return recalculatePrices({ ...prev, rooms });
    });
  }, [recalculatePrices]);
  
  const removeRoom = useCallback((id: string) => {
    setState(prev => {
      const rooms = prev.rooms.filter(r => r.id !== id);
      return recalculatePrices({ ...prev, rooms });
    });
  }, [recalculatePrices]);
  
  const updateTrades = useCallback((updates: Partial<TradeSelection>) => {
    setState(prev => {
      const trades = { ...prev.trades, ...updates };
      return recalculatePrices({ ...prev, trades });
    });
  }, [recalculatePrices]);
  
  const updateClientInfo = useCallback((updates: Partial<ClientInfo>) => {
    setState(prev => ({
      ...prev,
      clientInfo: { ...prev.clientInfo, ...updates },
    }));
  }, []);
  
  // Pricing override functions
  const setPricingMode = useCallback((mode: PricingMode) => {
    setState(prev => recalculatePrices({ 
      ...prev, 
      pricingMode: mode,
      overrideValue: mode === 'auto' ? null : prev.overrideValue,
    }));
  }, [recalculatePrices]);
  
  const setSellingPrice = useCallback((price: number) => {
    setState(prev => recalculatePrices({ 
      ...prev, 
      pricingMode: 'sell_price',
      overrideValue: price,
    }));
  }, [recalculatePrices]);
  
  const setTargetMargin = useCallback((margin: number) => {
    setState(prev => recalculatePrices({ 
      ...prev, 
      pricingMode: 'target_margin',
      overrideValue: margin,
    }));
  }, [recalculatePrices]);
  
  const resetToAutoMargin = useCallback(() => {
    setState(prev => recalculatePrices({ 
      ...prev, 
      pricingMode: 'auto',
      overrideValue: null,
    }));
  }, [recalculatePrices]);
  
  const lockEstimate = useCallback(() => {
    setState(prev => ({
      ...prev,
      isLocked: true,
      lockedAt: new Date(),
    }));
  }, []);
  
  const generateQuote = useCallback((): Quote => {
    const { rooms, clientInfo, location, hasGC, needsPermit, lowEstimate, highEstimate, recommendedPrice, internalCost, qualityLevel } = state;
    
    // Build room summary
    const roomsSummary = rooms.map(r => `${r.name} (${r.sqft} sq ft)`).join(' + ');
    
    // Build scope summary
    const scopeLabel = rooms.length > 0 ? 
      (rooms[0].scopeLevel === 'full_gut' ? 'Full remodel' :
       rooms[0].scopeLevel === 'shower_only' ? 'Shower conversion' :
       rooms[0].scopeLevel === 'partial' ? 'Partial update' : 'Cosmetic refresh') :
      'Full remodel';
    
    // Build permit/GC summary
    const permitGCSummary = hasGC && needsPermit ? 
      'Required – TKBSO to coordinate' : 
      hasGC ? 'GC partner handling' :
      'None required';
    
    // Build scope of work sections
    const scopeOfWork = [];
    
    if (state.trades.includePlumbing) {
      scopeOfWork.push({
        title: 'Plumbing',
        items: [
          'Rough plumbing for fixtures',
          'Supply/return relocation as needed',
          'Final trim-out and testing',
          'Fixtures supplied by homeowner unless noted',
        ],
      });
    }
    
    if (state.trades.includeTile) {
      scopeOfWork.push({
        title: 'Tile & Flooring',
        items: [
          'Remove existing tile/flooring',
          'Install Schluter waterproofing membrane',
          'Level substrate as needed',
          'Full height wall tile in wet areas',
          'Floor tile installation',
        ],
      });
    }
    
    if (state.trades.includeCabinetry) {
      scopeOfWork.push({
        title: 'Cabinetry',
        items: [
          state.trades.cabinetrySupplier === 'tkbso' ? 
            'TKBSO-supplied cabinetry' : 'Customer-supplied cabinetry',
          'Professional installation',
          'Hardware installation',
          'Final adjustments',
        ],
      });
    }
    
    if (state.trades.includeElectrical) {
      scopeOfWork.push({
        title: 'Electrical',
        items: [
          'Rough electrical as needed',
          state.trades.recessedCans > 0 ? `Install ${state.trades.recessedCans} recessed lights` : 'Lighting connections',
          'GFCI outlets in wet areas',
          'Final trim-out',
        ],
      });
    }
    
    if (state.trades.includeGlass && state.trades.glassType !== 'none') {
      scopeOfWork.push({
        title: 'Glass',
        items: [
          state.trades.glassType === 'frameless' ? 'Frameless glass enclosure' : 'Framed glass enclosure',
          'Professional measurement & install',
          'Hardware and seals',
        ],
      });
    }
    
    if (state.trades.includeCountertops) {
      scopeOfWork.push({
        title: 'Countertops',
        items: [
          'Template and fabrication',
          'Professional installation',
          'Undermount sink cutout',
          'Edge profile selection',
        ],
      });
    }
    
    // Build project name
    const projectType = rooms.length > 0 ? rooms[0].type : 'bathroom';
    const projectName = rooms.length > 1 && rooms.some(r => r.type !== projectType) ?
      'Whole Home Remodel' :
      `${projectType.charAt(0).toUpperCase() + projectType.slice(1)} Remodel`;
    
    const quote: Quote = {
      projectSnapshot: {
        name: clientInfo.name ? `${projectName} for ${clientInfo.name}` : projectName,
        location: clientInfo.address ? 
          `${clientInfo.address}, ${clientInfo.city}, ${clientInfo.state} ${clientInfo.zip || ''}` : 
          location || 'TBD',
        roomsSummary,
        scopeSummary: `${scopeLabel} – ${qualityLevel} finishes`,
        permitGCSummary,
      },
      clientInfo: clientInfo as ClientInfo,
      priceSummary: {
        lowEstimate,
        highEstimate,
        recommendedPrice,
        perSqftNote: '',
      },
      scopeOfWork,
      internalBreakdown: {
        internalCost,
        clientPrice: recommendedPrice,
        marginPercent: calculateMargin(internalCost, recommendedPrice),
        costBuckets: rooms.map(r => ({
          name: r.name,
          internal: Math.round(r.sqft * (r.type === 'bathroom' ? 240 : r.type === 'kitchen' ? 120 : 45)),
          client: Math.round(r.sqft * (r.type === 'bathroom' ? 370 : r.type === 'kitchen' ? 185 : 75)),
        })),
      },
      assumptions: [
        'Standard working hours (8am-5pm weekdays)',
        'Customer responsible for fixture selection',
        'Existing structure in good condition',
        'No mold or water damage remediation',
      ],
      openQuestions: [],
    };
    
    return quote;
  }, [state]);
  
  const setFinalQuote = useCallback((quote: Quote) => {
    setState(prev => ({ ...prev, finalQuote: quote, stage: 'complete' }));
  }, []);
  
  const reset = useCallback(() => {
    setState(initialState);
  }, []);
  
  const getTotalSqft = useCallback(() => {
    return state.rooms.reduce((sum, r) => sum + r.sqft, 0);
  }, [state.rooms]);
  
  const hasValidInputs = useCallback(() => {
    return state.projectType !== null && state.rooms.length > 0 && state.rooms.some(r => r.sqft > 0);
  }, [state.projectType, state.rooms]);
  
  const hasCompleteClientInfo = useCallback(() => {
    const { clientInfo } = state;
    return !!(clientInfo.name && clientInfo.address && clientInfo.city && clientInfo.state);
  }, [state.clientInfo]);
  
  return (
    <EstimatorContext.Provider value={{
      state,
      setStage,
      canProceed,
      setProjectType,
      setLocation,
      setHasGC,
      setNeedsPermit,
      setQualityLevel,
      addRoom,
      updateRoom,
      removeRoom,
      updateTrades,
      updateClientInfo,
      setPricingMode,
      setSellingPrice,
      setTargetMargin,
      resetToAutoMargin,
      lockEstimate,
      generateQuote,
      setFinalQuote,
      reset,
      getTotalSqft,
      hasValidInputs,
      hasCompleteClientInfo,
    }}>
      {children}
    </EstimatorContext.Provider>
  );
}

export function useEstimator() {
  const context = useContext(EstimatorContext);
  if (!context) {
    throw new Error('useEstimator must be used within an EstimatorProvider');
  }
  return context;
}
