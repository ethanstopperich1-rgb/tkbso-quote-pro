// ============================================
// KCC (KitchenCrest Cabinets) — Module Exports
// ============================================

export {
  KCC_SUPPLIER,
  KCC_COLORS,
  KCC_COLOR_MAP,
  calcDealerCost,
  getMsrp,
  getDealerCost,
} from './kcc-config';

export type {
  KccColorLine,
  KccDoorStyle,
  KccColorInfo,
  KccCabinetCategory,
  KccCabinetSpec,
} from './kcc-config';

export {
  findBySku,
  searchProducts,
  getByType,
  getCategories,
  priceItem,
  buildCabinetOrder,
  COMMON_VANITY_CONFIGS,
} from './kcc-helpers';

export type {
  KccProduct,
  KccPricedItem,
  KccCabinetOrder,
} from './kcc-helpers';
