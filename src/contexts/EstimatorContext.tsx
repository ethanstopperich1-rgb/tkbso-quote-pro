import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Quote, ClientInfo } from '@/types/estimator';
import { 
  calculateTKBSOEstimate, 
  calculateCPFromIC, 
  calculateMarginFromPrices,
  getMarginStatus,
  TKBSO_DEFAULT_PRICING,
  TKBSO_MARGINS,
  TKBSOJobInputs,
  TKBSOPricingResult,
} from '@/lib/tkbso-pricing';

export type ScopeLevel = 'full_gut' | 'partial' | 'shower_only' | 'refresh';
export type WorkflowStage = 'collecting' | 'confirming' | 'client_details' | 'generating' | 'complete';

export interface ShowerDimensions {
  lengthFt: number;
  widthFt: number;
  heightFt: number;
}

export interface BathroomFloorDimensions {
  lengthFt: number;
  widthFt: number;
}

export interface RoomData {
  id: string;
  type: 'kitchen' | 'bathroom' | 'closet';
  name: string;
  sqft: number;
  scopeLevel: ScopeLevel;
  // Tile areas (can be calculated from dimensions or set directly)
  tileWallSqft?: number;
  tileFloorSqft?: number;
  showerFloorSqft?: number;
  countertopSqft?: number;
  // Dimensions for calculations
  showerDimensions?: ShowerDimensions;
  bathroomFloorDimensions?: BathroomFloorDimensions;
}

export interface TradeSelection {
  // Core trades
  includeDemo: boolean;
  includeDumpster: boolean;
  includePlumbing: boolean;
  includeTile: boolean;
  includeWaterproofing: boolean;
  includeCementBoard: boolean;
  includeFraming: boolean;
  includeFloorLeveling: boolean;
  includeElectrical: boolean;
  includePainting: boolean;
  includeGlass: boolean;
  includeVanity: boolean;
  includeCountertops: boolean;
  includeCabinetry: boolean;
  includeLVP: boolean;
  lvpSqft: number;
  
  // Material allowance toggles
  includeTileMaterialAllowance: boolean;
  includePlumbingFixtureAllowance: boolean;
  includeMirrorAllowance: boolean;
  includeLightingFixtureAllowance: boolean;
  includeToiletAllowance: boolean;
  includeSinkFaucetAllowance: boolean;
  
  // Suppliers
  cabinetrySupplier: 'tkbso' | 'customer';
  
  // Type selections
  glassType: 'none' | 'standard' | 'panel_only' | '90_return';
  paintType: 'none' | 'patch' | 'full';
  framingType: 'none' | 'standard' | 'pony_wall';
  vanitySize: 'none' | '30' | '36' | '48' | '54' | '60' | '72' | '84';
  
  // Counts
  recessedCans: number;
  vanityLights: number;
  numToilets: number;
  numExtraShowerHeads: number;
  numToiletRelocations: number;
  numHardwarePulls: number;
  numNiches: number;
  glassSqft: number;
  
  // Special plumbing options
  includeTubToShower: boolean;
  includeSmartValve: boolean;
  includeLinearDrain: boolean;
  includeFreestandingTub: boolean;
  
  // Kitchen electrical options
  includeKitchenElectrical: boolean;
  includeMicrowaveCircuit: boolean;
  includeHoodRelocation: boolean;
  includeDishwasherDisposal: boolean;
}

export type PricingMode = 'auto' | 'sell_price' | 'target_margin';

export interface MarginStatus {
  status: 'low' | 'healthy' | 'good' | 'high';
  message: string;
  color: 'red' | 'yellow' | 'green' | 'orange';
}

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
  
  // Management fee
  includeManagementFee: boolean;
  managementFeePercent: number;
  
  // Labor only mode
  laborOnly: boolean;
  
  // Calculated values from TKBSO pricing
  pricingResult: TKBSOPricingResult | null;
  baseInternalCost: number;
  internalCost: number;
  recommendedPrice: number;
  lowEstimate: number;
  highEstimate: number;
  calculatedMargin: number;
  profit: number;
  marginStatus: MarginStatus | null;
  managementFeeAmount: number;
  
  // Lock status
  isLocked: boolean;
  lockedAt: Date | null;
  
  // Generated quote
  finalQuote: Quote | null;
}

const defaultTrades: TradeSelection = {
  // Core trades
  includeDemo: true,
  includeDumpster: true,
  includePlumbing: true,
  includeTile: true,
  includeWaterproofing: true,
  includeCementBoard: true,
  includeFraming: false,
  includeFloorLeveling: false,
  includeElectrical: false,
  includePainting: false,
  includeGlass: false,
  includeVanity: false,
  includeCountertops: false,
  includeCabinetry: false,
  includeLVP: false,
  lvpSqft: 0,
  
  // Material allowance toggles
  includeTileMaterialAllowance: true,
  includePlumbingFixtureAllowance: true,
  includeMirrorAllowance: false,
  includeLightingFixtureAllowance: false,
  includeToiletAllowance: false,
  includeSinkFaucetAllowance: false,
  
  // Suppliers
  cabinetrySupplier: 'tkbso',
  
  // Type selections
  glassType: 'none',
  paintType: 'none',
  framingType: 'none',
  vanitySize: 'none',
  
  // Counts
  recessedCans: 0,
  vanityLights: 0,
  numToilets: 0,
  numExtraShowerHeads: 0,
  numToiletRelocations: 0,
  numHardwarePulls: 0,
  numNiches: 0,
  glassSqft: 0,
  
  // Special plumbing options
  includeTubToShower: false,
  includeSmartValve: false,
  includeLinearDrain: false,
  includeFreestandingTub: false,
  
  // Kitchen electrical options
  includeKitchenElectrical: false,
  includeMicrowaveCircuit: false,
  includeHoodRelocation: false,
  includeDishwasherDisposal: false,
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
  includeManagementFee: false,
  managementFeePercent: 0.15,
  laborOnly: false,
  pricingResult: null,
  baseInternalCost: 0,
  internalCost: 0,
  recommendedPrice: 0,
  lowEstimate: 0,
  highEstimate: 0,
  calculatedMargin: 0,
  profit: 0,
  marginStatus: null,
  managementFeeAmount: 0,
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
  
  // Management fee & labor only
  setManagementFee: (enabled: boolean, percent?: number) => void;
  setLaborOnly: (enabled: boolean) => void;
  
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
  
  /**
   * Calculate prices using TKBSO real trade allowances
   * This is the MAIN pricing engine
   */
  const recalculatePrices = useCallback((newState: ProjectState): ProjectState => {
    // Aggregate tile areas from all bathroom rooms
    let totalWallTileSqft = 0;
    let totalFloorTileSqft = 0;
    let totalShowerFloorSqft = 0;
    let totalCountertopSqft = 0;
    
    // Determine project type for demo package
    let projectTypeForPricing: TKBSOJobInputs['projectType'] = 'small_bath';
    
    newState.rooms.forEach(room => {
      if (room.type === 'bathroom') {
        // Use provided tile sqft or calculate from dimensions
        if (room.tileWallSqft) {
          totalWallTileSqft += room.tileWallSqft;
        } else if (room.showerDimensions) {
          const perimeter = 2 * (room.showerDimensions.lengthFt + room.showerDimensions.widthFt);
          totalWallTileSqft += perimeter * room.showerDimensions.heightFt;
        }
        
        if (room.tileFloorSqft) {
          totalFloorTileSqft += room.tileFloorSqft;
        } else if (room.bathroomFloorDimensions) {
          totalFloorTileSqft += room.bathroomFloorDimensions.lengthFt * room.bathroomFloorDimensions.widthFt;
        }
        
        if (room.showerFloorSqft) {
          totalShowerFloorSqft += room.showerFloorSqft;
        } else if (room.showerDimensions) {
          totalShowerFloorSqft += room.showerDimensions.lengthFt * room.showerDimensions.widthFt;
        }
        
        if (room.countertopSqft) {
          totalCountertopSqft += room.countertopSqft;
        }
        
        // Determine project type
        if (room.scopeLevel === 'shower_only') {
          projectTypeForPricing = 'shower_only';
        } else if (room.sqft > 60) {
          projectTypeForPricing = 'large_bath';
        } else {
          projectTypeForPricing = 'small_bath';
        }
      } else if (room.type === 'kitchen') {
        projectTypeForPricing = newState.projectType === 'combination' ? 'combination' : 'kitchen';
        if (room.countertopSqft) {
          totalCountertopSqft += room.countertopSqft;
        }
      }
    });
    
    // If no tile areas calculated but we have rooms, estimate from sqft
    if (totalWallTileSqft === 0 && totalShowerFloorSqft === 0) {
      newState.rooms.forEach(room => {
        if (room.type === 'bathroom' && room.sqft > 0) {
          // Estimate shower as roughly 15 sqft floor, walls based on 8ft height
          if (room.scopeLevel === 'shower_only') {
            // For shower-only, estimate walls at ~3x floor area
            totalShowerFloorSqft += 15;
            totalWallTileSqft += 137; // Typical 3x5 shower at 8.5ft
          } else {
            // For full bath, include floor tile too
            totalShowerFloorSqft += 15;
            totalWallTileSqft += 100;
            totalFloorTileSqft += Math.max(0, room.sqft - 15); // Floor minus shower
          }
        }
      });
    }
    
    // Build TKBSO job inputs with all new fields
    const jobInputs: TKBSOJobInputs = {
      projectType: projectTypeForPricing,
      
      // Core trades
      includeDemo: newState.trades.includeDemo,
      includeDumpster: newState.trades.includeDumpster,
      includePlumbing: newState.trades.includePlumbing,
      includeTile: newState.trades.includeTile,
      includeWaterproofing: newState.trades.includeWaterproofing,
      includeCementBoard: newState.trades.includeCementBoard,
      includeFraming: newState.trades.includeFraming,
      includeFloorLeveling: newState.trades.includeFloorLeveling,
      includeElectrical: newState.trades.includeElectrical,
      includePaint: newState.trades.includePainting,
      includeGlass: newState.trades.includeGlass,
      includeVanity: newState.trades.includeVanity,
      includeCountertops: newState.trades.includeCountertops,
      
      // Material allowance toggles
      includeTileMaterialAllowance: newState.trades.includeTileMaterialAllowance,
      includePlumbingFixtureAllowance: newState.trades.includePlumbingFixtureAllowance,
      includeMirrorAllowance: newState.trades.includeMirrorAllowance,
      includeLightingFixtureAllowance: newState.trades.includeLightingFixtureAllowance,
      includeToiletAllowance: newState.trades.includeToiletAllowance,
      includeSinkFaucetAllowance: newState.trades.includeSinkFaucetAllowance,
      
      // Type selections
      glassType: newState.trades.glassType,
      paintType: newState.trades.paintType,
      framingType: newState.trades.framingType,
      vanitySize: newState.trades.vanitySize as any,
      
      // Counts
      numToilets: newState.trades.numToilets,
      numRecessedCans: newState.trades.recessedCans,
      numVanityLights: newState.trades.vanityLights,
      numExtraShowerHeads: newState.trades.numExtraShowerHeads,
      numToiletRelocations: newState.trades.numToiletRelocations,
      numHardwarePulls: newState.trades.numHardwarePulls,
      numNiches: newState.trades.numNiches,
      countertopSqft: totalCountertopSqft,
      
      // Special plumbing options
      includeTubToShower: newState.trades.includeTubToShower,
      includeSmartValve: newState.trades.includeSmartValve,
      includeLinearDrain: newState.trades.includeLinearDrain,
      includeFreestandingTub: newState.trades.includeFreestandingTub,
      
      // Kitchen electrical options
      includeKitchenElectrical: newState.trades.includeKitchenElectrical,
      includeMicrowaveCircuit: newState.trades.includeMicrowaveCircuit,
      includeHoodRelocation: newState.trades.includeHoodRelocation,
      includeDishwasherDisposal: newState.trades.includeDishwasherDisposal,
      
      // LVP Flooring
      includeLVP: newState.trades.includeLVP,
      lvpSqft: newState.trades.lvpSqft,
      
      // Tile sqft
      wallTileSqft: totalWallTileSqft,
      floorTileSqft: totalFloorTileSqft,
      showerFloorTileSqft: totalShowerFloorSqft,
    };
    
    // Calculate using TKBSO pricing engine
    const pricingResult = calculateTKBSOEstimate(jobInputs, TKBSO_DEFAULT_PRICING);
    
    // Base IC comes from trade-level calculations
    const baseIC = pricingResult.total_ic;
    
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
          finalMargin = calculateMarginFromPrices(baseIC, finalCP);
        } else {
          finalCP = pricingResult.total_cp;
          finalMargin = pricingResult.margin;
        }
        break;
        
      case 'target_margin':
        // Mode 2: Contractor sets margin, price calculated
        if (newState.overrideValue && newState.overrideValue > 0 && newState.overrideValue < 1) {
          finalMargin = newState.overrideValue;
          finalCP = calculateCPFromIC(baseIC, finalMargin);
        } else {
          finalMargin = tkbsoMargin;
          finalCP = calculateCPFromIC(baseIC, finalMargin);
        }
        break;
        
      case 'auto':
      default:
        // Mode 3: Use TKBSO standard CP from trade allowances
        finalCP = pricingResult.total_cp;
        finalMargin = pricingResult.margin;
        break;
    }
    
    // Apply minimum CP
    finalCP = Math.max(finalCP, TKBSO_DEFAULT_PRICING.min_job_cp);
    
    // Recalculate margin if minimum was applied
    if (finalCP !== pricingResult.total_cp && newState.pricingMode === 'auto') {
      finalMargin = calculateMarginFromPrices(baseIC, finalCP);
    }
    
    const profit = finalCP - baseIC;
    const marginStatus = getMarginStatus(finalMargin);
    
    // Calculate management fee if enabled
    let managementFeeAmount = 0;
    let finalPriceWithFee = finalCP;
    if (newState.includeManagementFee && newState.managementFeePercent > 0) {
      managementFeeAmount = Math.round(finalCP * newState.managementFeePercent);
      finalPriceWithFee = finalCP + managementFeeAmount;
    }
    
    return {
      ...newState,
      pricingResult,
      baseInternalCost: baseIC,
      internalCost: baseIC,
      recommendedPrice: Math.round(finalPriceWithFee),
      lowEstimate: Math.round(finalPriceWithFee * 0.95),
      highEstimate: Math.round(finalPriceWithFee * 1.05),
      calculatedMargin: finalMargin,
      profit: Math.round(profit + managementFeeAmount),
      marginStatus,
      managementFeeAmount,
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

  const setManagementFee = useCallback((enabled: boolean, percent?: number) => {
    setState(prev => recalculatePrices({ 
      ...prev, 
      includeManagementFee: enabled,
      managementFeePercent: percent ?? prev.managementFeePercent,
    }));
  }, [recalculatePrices]);

  const setLaborOnly = useCallback((enabled: boolean) => {
    setState(prev => recalculatePrices({ 
      ...prev, 
      laborOnly: enabled,
      // When labor-only, turn off material allowances
      trades: enabled ? {
        ...prev.trades,
        includeTileMaterialAllowance: false,
        includePlumbingFixtureAllowance: false,
        includeMirrorAllowance: false,
        includeLightingFixtureAllowance: false,
        includeToiletAllowance: false,
        includeSinkFaucetAllowance: false,
      } : prev.trades
    }));
  }, [recalculatePrices]);

  const generateQuote = useCallback((): Quote => {
    const { rooms, clientInfo, location, hasGC, needsPermit, lowEstimate, highEstimate, recommendedPrice, internalCost, qualityLevel, calculatedMargin, pricingResult } = state;
    
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
    
    // Build scope of work sections from trades
    const scopeOfWork = [];
    
    if (state.trades.includeDemo) {
      const demoItems = [
        'Remove existing fixtures, tile, and materials',
        'Protect adjacent areas during demolition',
        'Prep surfaces for new installation',
      ];
      if (state.trades.includeDumpster) {
        demoItems.push('Dumpster and debris haul-away included');
      }
      scopeOfWork.push({
        title: 'Demo & Site Prep',
        items: demoItems,
      });
    }
    
    if (state.trades.includePlumbing) {
      const plumbingItems = [
        'Rough-in for new shower valve, drain, and supply lines',
        'Install new shower pan/liner system',
        'Set and connect trim kit and fixtures',
        'Final pressure testing and leak verification',
      ];
      if (state.trades.numExtraShowerHeads > 0) {
        plumbingItems.push(`${state.trades.numExtraShowerHeads} additional shower head(s)`);
      }
      if (state.trades.includeTubToShower) {
        plumbingItems.push('Tub-to-shower conversion');
      }
      if (state.trades.includeFreestandingTub) {
        plumbingItems.push('Freestanding tub installation with floor filler');
      }
      if (state.trades.includeSmartValve) {
        plumbingItems.push('Smart valve system (Moen/Kohler digital)');
      }
      if (state.trades.includeLinearDrain) {
        plumbingItems.push('Linear drain system with pan grading');
      }
      if (state.trades.numToilets > 0) {
        plumbingItems.push(`${state.trades.numToilets} toilet swap(s)`);
      }
      if (state.trades.numToiletRelocations > 0) {
        plumbingItems.push(`${state.trades.numToiletRelocations} toilet relocation(s)`);
      }
      if (state.trades.includePlumbingFixtureAllowance) {
        plumbingItems.push('Plumbing fixture allowance included');
      }
      scopeOfWork.push({
        title: 'Plumbing',
        items: plumbingItems,
      });
    }
    
    if (state.trades.includeFraming && state.trades.framingType !== 'none') {
      scopeOfWork.push({
        title: 'Framing & Structure',
        items: state.trades.framingType === 'pony_wall' ? [
          'Pony wall construction',
          'Blocking for glass and fixtures',
        ] : [
          'Standard framing/blocking',
          'Niche, curb, and header support',
          'Blocking for glass installation',
        ],
      });
    }
    
    if (state.trades.includeTile) {
      const tileItems = [];
      if (state.trades.includeCementBoard) {
        tileItems.push('Install cement board substrate');
      }
      if (state.trades.includeWaterproofing) {
        tileItems.push('Apply Schluter waterproofing membrane system');
      }
      if (state.trades.includeFloorLeveling) {
        tileItems.push('Level substrate as needed for proper drainage');
      }
      tileItems.push(
        'Install wall tile in shower wet areas',
        'Install floor tile per layout',
        'Grout, clean, and seal as appropriate'
      );
      
      if (pricingResult) {
        tileItems.push(`Tile coverage: ${pricingResult.wall_tile_sqft} sqft walls, ${pricingResult.shower_floor_sqft} sqft shower floor`);
      }
      
      if (state.trades.includeTileMaterialAllowance) {
        tileItems.push('Tile material allowance included (tile, grout, thinset, sealer)');
      }
      
      scopeOfWork.push({
        title: 'Tile & Flooring',
        items: tileItems,
      });
    }
    
    if (state.trades.includeElectrical) {
      const electricalItems = ['Rough electrical as needed'];
      if (state.trades.recessedCans > 0) {
        electricalItems.push(`Install ${state.trades.recessedCans} recessed lights`);
      }
      if (state.trades.vanityLights > 0) {
        electricalItems.push(`Install ${state.trades.vanityLights} vanity light fixture(s)`);
      }
      if (state.trades.includeKitchenElectrical) {
        electricalItems.push('Kitchen electrical package');
      }
      if (state.trades.includeMicrowaveCircuit) {
        electricalItems.push('Dedicated microwave circuit');
      }
      if (state.trades.includeHoodRelocation) {
        electricalItems.push('Hood power relocation');
      }
      if (state.trades.includeDishwasherDisposal) {
        electricalItems.push('Dishwasher/disposal GFCI bundle');
      }
      electricalItems.push('GFCI outlets in wet areas', 'Final trim-out and testing');
      
      if (state.trades.includeLightingFixtureAllowance) {
        electricalItems.push('Lighting fixture allowance included');
      }
      
      scopeOfWork.push({
        title: 'Electrical',
        items: electricalItems,
      });
    }
    
    if (state.trades.includeGlass && state.trades.glassType !== 'none') {
      const glassLabel = state.trades.glassType === 'standard' ? 'Frameless glass enclosure with door' :
                        state.trades.glassType === 'panel_only' ? 'Fixed glass panel' :
                        '90° return glass (door + 2 panels)';
      scopeOfWork.push({
        title: 'Glass',
        items: [
          glassLabel,
          'Professional field measurement',
          'Hardware, hinges, and seals',
          'Final installation and adjustment',
        ],
      });
    }
    
    if (state.trades.includeVanity && state.trades.vanitySize !== 'none') {
      const vanityLabel = `${state.trades.vanitySize}" vanity with quartz top`;
      const vanityItems = [
        vanityLabel,
        'Undermount sink installation',
        'Professional installation and leveling',
        'Hardware and final adjustments',
      ];
      if (state.trades.includeMirrorAllowance) {
        vanityItems.push('Mirror allowance included');
      }
      if (state.trades.includeSinkFaucetAllowance) {
        vanityItems.push('Sink/faucet allowance included');
      }
      scopeOfWork.push({
        title: 'Cabinetry & Vanity',
        items: vanityItems,
      });
    }
    
    if (state.trades.includeCountertops && !state.trades.includeVanity) {
      const counterItems = [
        'Template and fabrication',
        'Professional installation',
        'Edge profile selection',
      ];
      scopeOfWork.push({
        title: 'Countertops',
        items: counterItems,
      });
    }
    
    if (state.trades.includePainting && state.trades.paintType !== 'none') {
      scopeOfWork.push({
        title: 'Paint & Finishes',
        items: state.trades.paintType === 'full' ? [
          'Patch and texture disturbed areas',
          'Prime as needed',
          'Paint walls, ceiling, and trim',
          'Final touch-up',
        ] : [
          'Patch and texture disturbed areas only',
          'Color-match existing finish',
        ],
      });
    }
    
    // Build project name
    const projectType = rooms.length > 0 ? rooms[0].type : 'bathroom';
    const projectName = rooms.length > 1 && rooms.some(r => r.type !== projectType) ?
      'Whole Home Remodel' :
      `${projectType.charAt(0).toUpperCase() + projectType.slice(1)} Remodel`;
    
    // Build cost buckets from pricing result
    const costBuckets = [];
    if (pricingResult) {
      if (pricingResult.demo_ic > 0) costBuckets.push({ name: 'Demo', internal: pricingResult.demo_ic, client: pricingResult.demo_cp });
      if (pricingResult.dumpster_ic > 0) costBuckets.push({ name: 'Dumpster', internal: pricingResult.dumpster_ic, client: pricingResult.dumpster_cp });
      if (pricingResult.plumbing_ic > 0) costBuckets.push({ name: 'Plumbing', internal: pricingResult.plumbing_ic, client: pricingResult.plumbing_cp });
      if (pricingResult.framing_ic > 0) costBuckets.push({ name: 'Framing', internal: pricingResult.framing_ic, client: pricingResult.framing_cp });
      if (pricingResult.tile_ic > 0) costBuckets.push({ name: 'Tile', internal: pricingResult.tile_ic, client: pricingResult.tile_cp });
      if (pricingResult.cement_board_ic > 0) costBuckets.push({ name: 'Cement Board', internal: pricingResult.cement_board_ic, client: pricingResult.cement_board_cp });
      if (pricingResult.waterproofing_ic > 0) costBuckets.push({ name: 'Waterproofing', internal: pricingResult.waterproofing_ic, client: pricingResult.waterproofing_cp });
      if (pricingResult.floor_leveling_ic > 0) costBuckets.push({ name: 'Floor Leveling', internal: pricingResult.floor_leveling_ic, client: pricingResult.floor_leveling_cp });
      if (pricingResult.electrical_ic > 0) costBuckets.push({ name: 'Electrical', internal: pricingResult.electrical_ic, client: pricingResult.electrical_cp });
      if (pricingResult.paint_ic > 0) costBuckets.push({ name: 'Paint', internal: pricingResult.paint_ic, client: pricingResult.paint_cp });
      if (pricingResult.glass_ic > 0) costBuckets.push({ name: 'Glass', internal: pricingResult.glass_ic, client: pricingResult.glass_cp });
      if (pricingResult.vanity_ic > 0) costBuckets.push({ name: 'Vanity', internal: pricingResult.vanity_ic, client: pricingResult.vanity_cp });
      if (pricingResult.countertop_ic > 0) costBuckets.push({ name: 'Countertops', internal: pricingResult.countertop_ic, client: pricingResult.countertop_cp });
      
      // Add allowances (CP only)
      if (pricingResult.total_allowances_cp > 0) {
        costBuckets.push({ name: 'Material Allowances', internal: 0, client: pricingResult.total_allowances_cp });
      }
    }
    
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
        marginPercent: calculatedMargin,
        costBuckets,
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
      setManagementFee,
      setLaborOnly,
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

// Re-export for convenience
export { TKBSO_MARGINS } from '@/lib/tkbso-pricing';
