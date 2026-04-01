// ============================================
// KCC (KitchenCrest Cabinets) — Complete Product Catalog
// Source: KCC Updated Prices October 2025
// Spec Book: 2024
// ============================================

import type { KccColorLine, KccCabinetCategory } from './kcc-config';

export interface KccProduct {
  sku: string;
  category: KccCabinetCategory | string;
  categoryLabel: string;
  description: string;
  width: number;
  height: number;
  depth: number;
  doors: number;
  drawers: number;
  cabinetType: 'base' | 'wall' | 'tall' | 'vanity' | 'accessory' | 'molding' | 'filler' | 'panel' | 'specialty';
  prices: Record<KccColorLine, number>;
  notes: string;
}

// ============================================
// BASE CABINETS
// All base cabinets: 34 1/2"H x 24"D unless noted
// ============================================

// ---- Base Cabinets - 1 Door ----
const BASE_1DOOR: KccProduct[] = [
  {
    sku: 'BT09', category: 'base_1door', categoryLabel: 'Base Cabinet - 1 Door',
    description: 'Base Tray Cabinet - 09"W x 34 1/2"H x 24"D',
    width: 9, height: 34.5, depth: 24, doors: 1, drawers: 0, cabinetType: 'base',
    prices: { SW: 229, LG: 236, SN: 243, MW: 243, EB: 264, EW: 264, ES: 264 },
    notes: 'Full height door, adjustable shelf. Specify hinge left or right.',
  },
];

// ---- Base Cabinets - 1 Door 1 Drawer ----
const BASE_1DOOR_1DRAWER: KccProduct[] = [
  {
    sku: 'B12', category: 'base_1door_1drawer', categoryLabel: 'Base Cabinet - 1 Door 1 Drawer',
    description: 'Base Cabinet - 12"W x 34 1/2"H x 24"D',
    width: 12, height: 34.5, depth: 24, doors: 1, drawers: 1, cabinetType: 'base',
    prices: { SW: 301, LG: 309, SN: 319, MW: 319, EB: 346, EW: 346, ES: 346 },
    notes: 'One door, one drawer. Adjustable half-depth shelf. Specify hinge left or right.',
  },
  {
    sku: 'B15', category: 'base_1door_1drawer', categoryLabel: 'Base Cabinet - 1 Door 1 Drawer',
    description: 'Base Cabinet - 15"W x 34 1/2"H x 24"D',
    width: 15, height: 34.5, depth: 24, doors: 1, drawers: 1, cabinetType: 'base',
    prices: { SW: 332, LG: 342, SN: 353, MW: 353, EB: 382, EW: 382, ES: 382 },
    notes: 'One door, one drawer. Adjustable half-depth shelf. Specify hinge left or right.',
  },
  {
    sku: 'B18', category: 'base_1door_1drawer', categoryLabel: 'Base Cabinet - 1 Door 1 Drawer',
    description: 'Base Cabinet - 18"W x 34 1/2"H x 24"D',
    width: 18, height: 34.5, depth: 24, doors: 1, drawers: 1, cabinetType: 'base',
    prices: { SW: 367, LG: 377, SN: 389, MW: 389, EB: 422, EW: 422, ES: 422 },
    notes: 'One door, one drawer. Adjustable half-depth shelf. Specify hinge left or right.',
  },
  {
    sku: 'B21', category: 'base_1door_1drawer', categoryLabel: 'Base Cabinet - 1 Door 1 Drawer',
    description: 'Base Cabinet - 21"W x 34 1/2"H x 24"D',
    width: 21, height: 34.5, depth: 24, doors: 1, drawers: 1, cabinetType: 'base',
    prices: { SW: 394, LG: 405, SN: 417, MW: 417, EB: 453, EW: 453, ES: 453 },
    notes: 'One door, one drawer. Adjustable half-depth shelf. Specify hinge left or right.',
  },
];

// ---- Base Cabinets - 2 Doors 1 Drawer ----
const BASE_2DOOR_1DRAWER: KccProduct[] = [
  {
    sku: 'B24', category: 'base_2door_1drawer', categoryLabel: 'Base Cabinet - 2 Doors 1 Drawer',
    description: 'Base Cabinet - 24"W x 34 1/2"H x 24"D',
    width: 24, height: 34.5, depth: 24, doors: 2, drawers: 1, cabinetType: 'base',
    prices: { SW: 440, LG: 453, SN: 467, MW: 467, EB: 506, EW: 506, ES: 506 },
    notes: 'Two doors, one drawer. Adjustable half-depth shelf.',
  },
  {
    sku: 'B27', category: 'base_2door_1drawer', categoryLabel: 'Base Cabinet - 2 Doors 1 Drawer',
    description: 'Base Cabinet - 27"W x 34 1/2"H x 24"D',
    width: 27, height: 34.5, depth: 24, doors: 2, drawers: 1, cabinetType: 'base',
    prices: { SW: 484, LG: 498, SN: 513, MW: 513, EB: 557, EW: 557, ES: 557 },
    notes: 'Two doors, one drawer. Adjustable half-depth shelf.',
  },
  {
    sku: 'B30', category: 'base_2door_1drawer', categoryLabel: 'Base Cabinet - 2 Doors 1 Drawer',
    description: 'Base Cabinet - 30"W x 34 1/2"H x 24"D',
    width: 30, height: 34.5, depth: 24, doors: 2, drawers: 1, cabinetType: 'base',
    prices: { SW: 563, LG: 580, SN: 598, MW: 598, EB: 647, EW: 647, ES: 647 },
    notes: 'Two doors, one drawer. Adjustable half-depth shelf.',
  },
];

// ---- Base Cabinets - 2 Doors 2 Drawers ----
const BASE_2DOOR_2DRAWER: KccProduct[] = [
  {
    sku: 'B33', category: 'base_2door_2drawer', categoryLabel: 'Base Cabinet - 2 Doors 2 Drawers',
    description: 'Base Cabinet - 33"W x 34 1/2"H x 24"D',
    width: 33, height: 34.5, depth: 24, doors: 2, drawers: 2, cabinetType: 'base',
    prices: { SW: 596, LG: 614, SN: 632, MW: 632, EB: 685, EW: 685, ES: 685 },
    notes: 'Two doors, two drawers. Adjustable half-depth shelf.',
  },
  {
    sku: 'B36', category: 'base_2door_2drawer', categoryLabel: 'Base Cabinet - 2 Doors 2 Drawers',
    description: 'Base Cabinet - 36"W x 34 1/2"H x 24"D',
    width: 36, height: 34.5, depth: 24, doors: 2, drawers: 2, cabinetType: 'base',
    prices: { SW: 626, LG: 644, SN: 664, MW: 664, EB: 720, EW: 720, ES: 720 },
    notes: 'Two doors, two drawers. Adjustable half-depth shelf.',
  },
  {
    sku: 'B39', category: 'base_2door_2drawer', categoryLabel: 'Base Cabinet - 2 Doors 2 Drawers',
    description: 'Base Cabinet - 39"W x 34 1/2"H x 24"D',
    width: 39, height: 34.5, depth: 24, doors: 2, drawers: 2, cabinetType: 'base',
    prices: { SW: 655, LG: 674, SN: 695, MW: 695, EB: 753, EW: 753, ES: 753 },
    notes: 'Two doors, two drawers. Adjustable half-depth shelf.',
  },
  {
    sku: 'B42', category: 'base_2door_2drawer', categoryLabel: 'Base Cabinet - 2 Doors 2 Drawers',
    description: 'Base Cabinet - 42"W x 34 1/2"H x 24"D',
    width: 42, height: 34.5, depth: 24, doors: 2, drawers: 2, cabinetType: 'base',
    prices: { SW: 684, LG: 705, SN: 725, MW: 725, EB: 787, EW: 787, ES: 787 },
    notes: 'Two doors, two drawers. Adjustable half-depth shelf.',
  },
];

// ---- Drawer Base Cabinets - 2 Drawers ----
const DRAWER_BASE_2DRAWER: KccProduct[] = [
  {
    sku: '2DB24', category: 'drawer_base_2drawer', categoryLabel: 'Drawer Base Cabinet - 2 Drawers',
    description: 'Drawer Base Cabinet - 24"W x 34 1/2"H x 24"D',
    width: 24, height: 34.5, depth: 24, doors: 0, drawers: 2, cabinetType: 'base',
    prices: { SW: 614, LG: 632, SN: 659, MW: 659, EB: 746, EW: 746, ES: 746 },
    notes: 'Two full-width drawers. Soft-close.',
  },
  {
    sku: '2DB30', category: 'drawer_base_2drawer', categoryLabel: 'Drawer Base Cabinet - 2 Drawers',
    description: 'Drawer Base Cabinet - 30"W x 34 1/2"H x 24"D',
    width: 30, height: 34.5, depth: 24, doors: 0, drawers: 2, cabinetType: 'base',
    prices: { SW: 669, LG: 690, SN: 772, MW: 772, EB: 769, EW: 769, ES: 769 },
    notes: 'Two full-width drawers. Soft-close.',
  },
  {
    sku: '2DB36', category: 'drawer_base_2drawer', categoryLabel: 'Drawer Base Cabinet - 2 Drawers',
    description: 'Drawer Base Cabinet - 36"W x 34 1/2"H x 24"D',
    width: 36, height: 34.5, depth: 24, doors: 0, drawers: 2, cabinetType: 'base',
    prices: { SW: 727, LG: 749, SN: 927, MW: 927, EB: 836, EW: 836, ES: 836 },
    notes: 'Two full-width drawers. Soft-close.',
  },
];

// ---- Drawer Base Cabinets - 3 Drawers ----
const DRAWER_BASE_3DRAWER: KccProduct[] = [
  {
    sku: '3DB12', category: 'drawer_base_3drawer', categoryLabel: 'Drawer Base Cabinet - 3 Drawers',
    description: 'Drawer Base Cabinet - 12"W x 34 1/2"H x 24"D',
    width: 12, height: 34.5, depth: 24, doors: 0, drawers: 3, cabinetType: 'base',
    prices: { SW: 475, LG: 489, SN: 503, MW: 503, EB: 546, EW: 546, ES: 546 },
    notes: 'Three full-width drawers. Soft-close.',
  },
  {
    sku: '3DB15', category: 'drawer_base_3drawer', categoryLabel: 'Drawer Base Cabinet - 3 Drawers',
    description: 'Drawer Base Cabinet - 15"W x 34 1/2"H x 24"D',
    width: 15, height: 34.5, depth: 24, doors: 0, drawers: 3, cabinetType: 'base',
    prices: { SW: 509, LG: 524, SN: 540, MW: 540, EB: 586, EW: 586, ES: 586 },
    notes: 'Three full-width drawers. Soft-close.',
  },
  {
    sku: '3DB18', category: 'drawer_base_3drawer', categoryLabel: 'Drawer Base Cabinet - 3 Drawers',
    description: 'Drawer Base Cabinet - 18"W x 34 1/2"H x 24"D',
    width: 18, height: 34.5, depth: 24, doors: 0, drawers: 3, cabinetType: 'base',
    prices: { SW: 530, LG: 546, SN: 562, MW: 562, EB: 610, EW: 610, ES: 610 },
    notes: 'Three full-width drawers. Soft-close.',
  },
  {
    sku: '3DB21', category: 'drawer_base_3drawer', categoryLabel: 'Drawer Base Cabinet - 3 Drawers',
    description: 'Drawer Base Cabinet - 21"W x 34 1/2"H x 24"D',
    width: 21, height: 34.5, depth: 24, doors: 0, drawers: 3, cabinetType: 'base',
    prices: { SW: 562, LG: 579, SN: 597, MW: 597, EB: 646, EW: 646, ES: 646 },
    notes: 'Three full-width drawers. Soft-close.',
  },
  {
    sku: '3DB24', category: 'drawer_base_3drawer', categoryLabel: 'Drawer Base Cabinet - 3 Drawers',
    description: 'Drawer Base Cabinet - 24"W x 34 1/2"H x 24"D',
    width: 24, height: 34.5, depth: 24, doors: 0, drawers: 3, cabinetType: 'base',
    prices: { SW: 596, LG: 614, SN: 632, MW: 632, EB: 685, EW: 685, ES: 685 },
    notes: 'Three full-width drawers. Soft-close.',
  },
  {
    sku: '3DB27', category: 'drawer_base_3drawer', categoryLabel: 'Drawer Base Cabinet - 3 Drawers',
    description: 'Drawer Base Cabinet - 27"W x 34 1/2"H x 24"D',
    width: 27, height: 34.5, depth: 24, doors: 0, drawers: 3, cabinetType: 'base',
    prices: { SW: 638, LG: 657, SN: 675, MW: 675, EB: 734, EW: 734, ES: 734 },
    notes: 'Three full-width drawers. Soft-close.',
  },
  {
    sku: '3DB30', category: 'drawer_base_3drawer', categoryLabel: 'Drawer Base Cabinet - 3 Drawers',
    description: 'Drawer Base Cabinet - 30"W x 34 1/2"H x 24"D',
    width: 30, height: 34.5, depth: 24, doors: 0, drawers: 3, cabinetType: 'base',
    prices: { SW: 669, LG: 690, SN: 710, MW: 710, EB: 769, EW: 769, ES: 769 },
    notes: 'Three full-width drawers. Soft-close.',
  },
  {
    sku: '3DB33', category: 'drawer_base_3drawer', categoryLabel: 'Drawer Base Cabinet - 3 Drawers',
    description: 'Drawer Base Cabinet - 33"W x 34 1/2"H x 24"D',
    width: 33, height: 34.5, depth: 24, doors: 0, drawers: 3, cabinetType: 'base',
    prices: { SW: 698, LG: 719, SN: 740, MW: 740, EB: 803, EW: 803, ES: 803 },
    notes: 'Three full-width drawers. Soft-close.',
  },
  {
    sku: '3DB36', category: 'drawer_base_3drawer', categoryLabel: 'Drawer Base Cabinet - 3 Drawers',
    description: 'Drawer Base Cabinet - 36"W x 34 1/2"H x 24"D',
    width: 36, height: 34.5, depth: 24, doors: 0, drawers: 3, cabinetType: 'base',
    prices: { SW: 727, LG: 749, SN: 772, MW: 772, EB: 836, EW: 836, ES: 836 },
    notes: 'Three full-width drawers. Soft-close.',
  },
];

// ---- Spice Rack Base Cabinets - 1 Door Pullout ----
const SPICE_RACK_BASE: KccProduct[] = [
  {
    sku: 'SPB6', category: 'spice_rack_base', categoryLabel: 'Spice Rack Base Cabinet - 1 Door Pullout',
    description: 'Spice Rack Base Cabinet - 06"W x 34 1/2"H x 24"D',
    width: 6, height: 34.5, depth: 24, doors: 1, drawers: 0, cabinetType: 'base',
    prices: { SW: 353, LG: 363, SN: 374, MW: 374, EB: 405, EW: 405, ES: 405 },
    notes: 'Full-height pullout spice rack behind door panel.',
  },
  {
    sku: 'SPB9', category: 'spice_rack_base', categoryLabel: 'Spice Rack Base Cabinet - 1 Door Pullout',
    description: 'Spice Rack Base Cabinet - 09"W x 34 1/2"H x 24"D',
    width: 9, height: 34.5, depth: 24, doors: 1, drawers: 0, cabinetType: 'base',
    prices: { SW: 396, LG: 408, SN: 420, MW: 420, EB: 455, EW: 455, ES: 455 },
    notes: 'Full-height pullout spice rack behind door panel.',
  },
];

// ---- Base Waste Bin Cabinet ----
const WASTE_BIN_BASE: KccProduct[] = [
  {
    sku: 'BWB18', category: 'waste_bin_base', categoryLabel: 'Base Waste Bin Cabinet',
    description: 'Base Waste Bin Cabinet - 18"W x 34 1/2"H x 24"D',
    width: 18, height: 34.5, depth: 24, doors: 1, drawers: 0, cabinetType: 'base',
    prices: { SW: 505, LG: 520, SN: 535, MW: 535, EB: 580, EW: 580, ES: 580 },
    notes: 'Single door with pullout waste bin frame. Bins sold separately (TRASHCAN 35qt).',
  },
];

// ---- Trash Bins ----
const TRASH_BINS: KccProduct[] = [
  {
    sku: 'TRASHCAN', category: 'trash_bin', categoryLabel: 'Trash Bin',
    description: '35qt Trash Can for BWB18',
    width: 0, height: 0, depth: 0, doors: 0, drawers: 0, cabinetType: 'accessory',
    prices: { SW: 54, LG: 54, SN: 54, MW: 54, EB: 54, EW: 54, ES: 54 },
    notes: 'Universal 35qt replacement bin. Fits BWB18 waste bin cabinet.',
  },
];

// ---- Angled Base End Cabinets ----
const ANGLED_BASE_END: KccProduct[] = [
  {
    sku: 'BEC24', category: 'angled_base_end', categoryLabel: 'Angled Base End Cabinet',
    description: 'Angled Base End Cabinet - 24"W x 34 1/2"H x 24"D',
    width: 24, height: 34.5, depth: 24, doors: 1, drawers: 0, cabinetType: 'base',
    prices: { SW: 371, LG: 382, SN: 394, MW: 394, EB: 426, EW: 426, ES: 426 },
    notes: 'Angled end cabinet for island or peninsula. One door, one shelf.',
  },
];

// ---- Microwave Base Cabinet ----
const MICROWAVE_BASE: KccProduct[] = [
  {
    sku: 'MB30', category: 'microwave_base', categoryLabel: 'Microwave Base Cabinet',
    description: 'Microwave Base Cabinet - 30"W x 34 1/2"H x 24"D',
    width: 30, height: 34.5, depth: 24, doors: 1, drawers: 1, cabinetType: 'base',
    prices: { SW: 530, LG: 546, SN: 562, MW: 562, EB: 610, EW: 610, ES: 610 },
    notes: 'Open shelf for microwave above, drawer below. Door on bottom section.',
  },
];

// ---- Easy Reach Base Corner - Bifold Doors ----
const EASY_REACH_BASE: KccProduct[] = [
  {
    sku: 'ERB33', category: 'easy_reach_base_corner', categoryLabel: 'Easy Reach Base Corner - Bifold Doors',
    description: 'Easy Reach Base Corner Cabinet - 33"W x 34 1/2"H x 24"D',
    width: 33, height: 34.5, depth: 24, doors: 2, drawers: 0, cabinetType: 'base',
    prices: { SW: 507, LG: 522, SN: 538, MW: 538, EB: 583, EW: 583, ES: 583 },
    notes: 'Bifold door corner cabinet. Requires 33" on each wall.',
  },
  {
    sku: 'ERB36', category: 'easy_reach_base_corner', categoryLabel: 'Easy Reach Base Corner - Bifold Doors',
    description: 'Easy Reach Base Corner Cabinet - 36"W x 34 1/2"H x 24"D',
    width: 36, height: 34.5, depth: 24, doors: 2, drawers: 0, cabinetType: 'base',
    prices: { SW: 563, LG: 580, SN: 598, MW: 598, EB: 647, EW: 647, ES: 647 },
    notes: 'Bifold door corner cabinet. Requires 36" on each wall.',
  },
];

// ---- Base Blind Corner Cabinets ----
const BLIND_BASE_CORNER: KccProduct[] = [
  {
    sku: 'BBC39', category: 'blind_base_corner', categoryLabel: 'Base Blind Corner Cabinet',
    description: 'Base Blind Corner Cabinet - 36"W (fits 39") x 34 1/2"H x 24"D',
    width: 36, height: 34.5, depth: 24, doors: 1, drawers: 1, cabinetType: 'base',
    prices: { SW: 551, LG: 456, SN: 528, MW: 528, EB: 634, EW: 634, ES: 634 },
    notes: 'Blind corner cabinet. 36" cabinet body, requires 39" opening. Filler required.',
  },
  {
    sku: 'BBC42', category: 'blind_base_corner', categoryLabel: 'Base Blind Corner Cabinet',
    description: 'Base Blind Corner Cabinet - 39"W (fits 42") x 34 1/2"H x 24"D',
    width: 39, height: 34.5, depth: 24, doors: 1, drawers: 1, cabinetType: 'base',
    prices: { SW: 497, LG: 512, SN: 585, MW: 585, EB: 572, EW: 572, ES: 572 },
    notes: 'Blind corner cabinet. 39" cabinet body, requires 42" opening. Filler required.',
  },
  {
    sku: 'BBC45', category: 'blind_base_corner', categoryLabel: 'Base Blind Corner Cabinet',
    description: 'Base Blind Corner Cabinet - 42"W (fits 45") x 34 1/2"H x 24"D',
    width: 42, height: 34.5, depth: 24, doors: 1, drawers: 1, cabinetType: 'base',
    prices: { SW: 540, LG: 557, SN: 606, MW: 606, EB: 621, EW: 621, ES: 621 },
    notes: 'Blind corner cabinet. 42" cabinet body, requires 45" opening. Filler required.',
  },
];

// ---- Corner Sink Base Cabinet ----
const CORNER_SINK_BASE: KccProduct[] = [
  {
    sku: 'CSB36', category: 'corner_sink_base', categoryLabel: 'Corner Sink Base Cabinet',
    description: 'Corner Sink Base Cabinet - 36"W x 34 1/2"H x 24"D',
    width: 36, height: 34.5, depth: 24, doors: 2, drawers: 0, cabinetType: 'base',
    prices: { SW: 498, LG: 513, SN: 529, MW: 529, EB: 573, EW: 573, ES: 573 },
    notes: 'Diagonal corner sink base. Requires 36" on each wall. Butt doors.',
  },
];

// ---- Sink Base Cabinets - 1 Fake Drawer ----
const SINK_BASE_1FAKE: KccProduct[] = [
  {
    sku: 'SB30', category: 'sink_base_1fake', categoryLabel: 'Sink Base Cabinet - 1 False Drawer',
    description: 'Sink Base Cabinet - 30"W x 34 1/2"H x 24"D',
    width: 30, height: 34.5, depth: 24, doors: 2, drawers: 0, cabinetType: 'base',
    prices: { SW: 413, LG: 425, SN: 438, MW: 438, EB: 475, EW: 475, ES: 475 },
    notes: 'Two doors, one false drawer front. Open interior for plumbing.',
  },
];

// ---- Sink Base Cabinets - 2 Fake Drawers ----
const SINK_BASE_2FAKE: KccProduct[] = [
  {
    sku: 'SB33', category: 'sink_base_2fake', categoryLabel: 'Sink Base Cabinet - 2 False Drawers',
    description: 'Sink Base Cabinet - 33"W x 34 1/2"H x 24"D',
    width: 33, height: 34.5, depth: 24, doors: 2, drawers: 0, cabinetType: 'base',
    prices: { SW: 440, LG: 453, SN: 467, MW: 467, EB: 506, EW: 506, ES: 506 },
    notes: 'Two doors, two false drawer fronts. Open interior for plumbing.',
  },
  {
    sku: 'SB36', category: 'sink_base_2fake', categoryLabel: 'Sink Base Cabinet - 2 False Drawers',
    description: 'Sink Base Cabinet - 36"W x 34 1/2"H x 24"D',
    width: 36, height: 34.5, depth: 24, doors: 2, drawers: 0, cabinetType: 'base',
    prices: { SW: 477, LG: 491, SN: 506, MW: 506, EB: 548, EW: 548, ES: 548 },
    notes: 'Two doors, two false drawer fronts. Open interior for plumbing.',
  },
];

// ---- Farm Sink Base Cabinet ----
const FARM_SINK_BASE: KccProduct[] = [
  {
    sku: 'FSB36', category: 'farm_sink_base', categoryLabel: 'Farm Sink Base Cabinet',
    description: 'Farm Sink Base Cabinet - 36"W x 34 1/2"H x 24"D',
    width: 36, height: 34.5, depth: 24, doors: 2, drawers: 0, cabinetType: 'base',
    prices: { SW: 477, LG: 491, SN: 506, MW: 506, EB: 548, EW: 548, ES: 548 },
    notes: 'Farmhouse/apron sink base. No top rail for apron-front sink installation.',
  },
];

// ============================================
// WALL CABINETS
// Standard depth 12" unless noted
// ============================================

// ---- Wall Cabinets 30"H - 1 Door ----
const WALL_30H_1DOOR: KccProduct[] = [
  {
    sku: 'W0930', category: 'wall_30h_1door', categoryLabel: 'Wall Cabinet 30"H - 1 Door',
    description: 'Wall Cabinet - 09"W x 30"H x 12"D',
    width: 9, height: 30, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 158, LG: 162, SN: 168, MW: 168, EB: 182, EW: 182, ES: 182 },
    notes: 'Single door. Two adjustable shelves. Specify hinge left or right.',
  },
  {
    sku: 'W1230', category: 'wall_30h_1door', categoryLabel: 'Wall Cabinet 30"H - 1 Door',
    description: 'Wall Cabinet - 12"W x 30"H x 12"D',
    width: 12, height: 30, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 178, LG: 183, SN: 188, MW: 188, EB: 205, EW: 205, ES: 205 },
    notes: 'Single door. Two adjustable shelves. Specify hinge left or right.',
  },
  {
    sku: 'W1530', category: 'wall_30h_1door', categoryLabel: 'Wall Cabinet 30"H - 1 Door',
    description: 'Wall Cabinet - 15"W x 30"H x 12"D',
    width: 15, height: 30, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 206, LG: 212, SN: 219, MW: 219, EB: 237, EW: 237, ES: 237 },
    notes: 'Single door. Two adjustable shelves. Specify hinge left or right.',
  },
  {
    sku: 'W1830', category: 'wall_30h_1door', categoryLabel: 'Wall Cabinet 30"H - 1 Door',
    description: 'Wall Cabinet - 18"W x 30"H x 12"D',
    width: 18, height: 30, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 231, LG: 237, SN: 245, MW: 245, EB: 265, EW: 265, ES: 265 },
    notes: 'Single door. Two adjustable shelves. Specify hinge left or right.',
  },
  {
    sku: 'W2130', category: 'wall_30h_1door', categoryLabel: 'Wall Cabinet 30"H - 1 Door',
    description: 'Wall Cabinet - 21"W x 30"H x 12"D',
    width: 21, height: 30, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 250, LG: 258, SN: 265, MW: 265, EB: 288, EW: 288, ES: 288 },
    notes: 'Single door. Two adjustable shelves. Specify hinge left or right.',
  },
];

// ---- Wall Cabinets 30"H - 2 Doors ----
const WALL_30H_2DOOR: KccProduct[] = [
  {
    sku: 'W2430', category: 'wall_30h_2door', categoryLabel: 'Wall Cabinet 30"H - 2 Doors',
    description: 'Wall Cabinet - 24"W x 30"H x 12"D',
    width: 24, height: 30, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 309, LG: 319, SN: 329, MW: 329, EB: 356, EW: 356, ES: 356 },
    notes: 'Two doors. Two adjustable shelves.',
  },
  {
    sku: 'W2730', category: 'wall_30h_2door', categoryLabel: 'Wall Cabinet 30"H - 2 Doors',
    description: 'Wall Cabinet - 27"W x 30"H x 12"D',
    width: 27, height: 30, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 331, LG: 341, SN: 351, MW: 351, EB: 381, EW: 381, ES: 381 },
    notes: 'Two doors. Two adjustable shelves.',
  },
  {
    sku: 'W3030', category: 'wall_30h_2door', categoryLabel: 'Wall Cabinet 30"H - 2 Doors',
    description: 'Wall Cabinet - 30"W x 30"H x 12"D',
    width: 30, height: 30, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 371, LG: 382, SN: 394, MW: 394, EB: 426, EW: 426, ES: 426 },
    notes: 'Two doors. Two adjustable shelves.',
  },
  {
    sku: 'W3330', category: 'wall_30h_2door', categoryLabel: 'Wall Cabinet 30"H - 2 Doors',
    description: 'Wall Cabinet - 33"W x 30"H x 12"D',
    width: 33, height: 30, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 395, LG: 407, SN: 418, MW: 418, EB: 454, EW: 454, ES: 454 },
    notes: 'Two doors. Two adjustable shelves.',
  },
  {
    sku: 'W3630', category: 'wall_30h_2door', categoryLabel: 'Wall Cabinet 30"H - 2 Doors',
    description: 'Wall Cabinet - 36"W x 30"H x 12"D',
    width: 36, height: 30, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 421, LG: 434, SN: 447, MW: 447, EB: 483, EW: 483, ES: 483 },
    notes: 'Two doors. Two adjustable shelves.',
  },
  {
    sku: 'W3930', category: 'wall_30h_2door', categoryLabel: 'Wall Cabinet 30"H - 2 Doors',
    description: 'Wall Cabinet - 39"W x 30"H x 12"D',
    width: 39, height: 30, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 447, LG: 459, SN: 474, MW: 474, EB: 513, EW: 513, ES: 513 },
    notes: 'Two doors. Two adjustable shelves.',
  },
  {
    sku: 'W4230', category: 'wall_30h_2door', categoryLabel: 'Wall Cabinet 30"H - 2 Doors',
    description: 'Wall Cabinet - 42"W x 30"H x 12"D',
    width: 42, height: 30, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 472, LG: 486, SN: 502, MW: 502, EB: 544, EW: 544, ES: 544 },
    notes: 'Two doors. Two adjustable shelves.',
  },
];

// ---- Wall Cabinets 36"H - 1 Door ----
const WALL_36H_1DOOR: KccProduct[] = [
  {
    sku: 'W0936', category: 'wall_36h_1door', categoryLabel: 'Wall Cabinet 36"H - 1 Door',
    description: 'Wall Cabinet - 09"W x 36"H x 12"D',
    width: 9, height: 36, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 177, LG: 182, SN: 187, MW: 187, EB: 202, EW: 202, ES: 202 },
    notes: 'Single door. Two adjustable shelves. Specify hinge left or right.',
  },
  {
    sku: 'W1236', category: 'wall_36h_1door', categoryLabel: 'Wall Cabinet 36"H - 1 Door',
    description: 'Wall Cabinet - 12"W x 36"H x 12"D',
    width: 12, height: 36, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 204, LG: 210, SN: 216, MW: 216, EB: 234, EW: 234, ES: 234 },
    notes: 'Single door. Two adjustable shelves. Specify hinge left or right.',
  },
  {
    sku: 'W1536', category: 'wall_36h_1door', categoryLabel: 'Wall Cabinet 36"H - 1 Door',
    description: 'Wall Cabinet - 15"W x 36"H x 12"D',
    width: 15, height: 36, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 231, LG: 237, SN: 245, MW: 245, EB: 265, EW: 265, ES: 265 },
    notes: 'Single door. Two adjustable shelves. Specify hinge left or right.',
  },
  {
    sku: 'W1836', category: 'wall_36h_1door', categoryLabel: 'Wall Cabinet 36"H - 1 Door',
    description: 'Wall Cabinet - 18"W x 36"H x 12"D',
    width: 18, height: 36, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 261, LG: 268, SN: 277, MW: 277, EB: 300, EW: 300, ES: 300 },
    notes: 'Single door. Two adjustable shelves. Specify hinge left or right.',
  },
  {
    sku: 'W2136', category: 'wall_36h_1door', categoryLabel: 'Wall Cabinet 36"H - 1 Door',
    description: 'Wall Cabinet - 21"W x 36"H x 12"D',
    width: 21, height: 36, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 294, LG: 303, SN: 313, MW: 313, EB: 339, EW: 339, ES: 339 },
    notes: 'Single door. Two adjustable shelves. Specify hinge left or right.',
  },
];

// ---- Wall Cabinets 36"H - 2 Doors ----
const WALL_36H_2DOOR: KccProduct[] = [
  {
    sku: 'W2436', category: 'wall_36h_2door', categoryLabel: 'Wall Cabinet 36"H - 2 Doors',
    description: 'Wall Cabinet - 24"W x 36"H x 12"D',
    width: 24, height: 36, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 334, LG: 344, SN: 355, MW: 355, EB: 384, EW: 384, ES: 384 },
    notes: 'Two doors. Two adjustable shelves.',
  },
  {
    sku: 'W2736', category: 'wall_36h_2door', categoryLabel: 'Wall Cabinet 36"H - 2 Doors',
    description: 'Wall Cabinet - 27"W x 36"H x 12"D',
    width: 27, height: 36, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 359, LG: 370, SN: 381, MW: 381, EB: 413, EW: 413, ES: 413 },
    notes: 'Two doors. Two adjustable shelves.',
  },
  {
    sku: 'W3036', category: 'wall_36h_2door', categoryLabel: 'Wall Cabinet 36"H - 2 Doors',
    description: 'Wall Cabinet - 30"W x 36"H x 12"D',
    width: 30, height: 36, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 413, LG: 425, SN: 438, MW: 438, EB: 475, EW: 475, ES: 475 },
    notes: 'Two doors. Two adjustable shelves.',
  },
  {
    sku: 'W3336', category: 'wall_36h_2door', categoryLabel: 'Wall Cabinet 36"H - 2 Doors',
    description: 'Wall Cabinet - 33"W x 36"H x 12"D',
    width: 33, height: 36, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 450, LG: 463, SN: 477, MW: 477, EB: 517, EW: 517, ES: 517 },
    notes: 'Two doors. Two adjustable shelves.',
  },
  {
    sku: 'W3636', category: 'wall_36h_2door', categoryLabel: 'Wall Cabinet 36"H - 2 Doors',
    description: 'Wall Cabinet - 36"W x 36"H x 12"D',
    width: 36, height: 36, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 479, LG: 493, SN: 508, MW: 508, EB: 550, EW: 550, ES: 550 },
    notes: 'Two doors. Two adjustable shelves.',
  },
  {
    sku: 'W3936', category: 'wall_36h_2door', categoryLabel: 'Wall Cabinet 36"H - 2 Doors',
    description: 'Wall Cabinet - 39"W x 36"H x 12"D',
    width: 39, height: 36, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 540, LG: 557, SN: 573, MW: 573, EB: 621, EW: 621, ES: 621 },
    notes: 'Two doors. Two adjustable shelves.',
  },
  {
    sku: 'W4236', category: 'wall_36h_2door', categoryLabel: 'Wall Cabinet 36"H - 2 Doors',
    description: 'Wall Cabinet - 42"W x 36"H x 12"D',
    width: 42, height: 36, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 573, LG: 590, SN: 610, MW: 610, EB: 659, EW: 659, ES: 659 },
    notes: 'Two doors. Two adjustable shelves.',
  },
];

// ---- Wall Cabinets 42"H - 1 Door ----
const WALL_42H_1DOOR: KccProduct[] = [
  {
    sku: 'W0942', category: 'wall_42h_1door', categoryLabel: 'Wall Cabinet 42"H - 1 Door',
    description: 'Wall Cabinet - 09"W x 42"H x 12"D',
    width: 9, height: 42, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 199, LG: 206, SN: 212, MW: 212, EB: 229, EW: 229, ES: 229 },
    notes: 'Single door. Three adjustable shelves. Specify hinge left or right.',
  },
  {
    sku: 'W1242', category: 'wall_42h_1door', categoryLabel: 'Wall Cabinet 42"H - 1 Door',
    description: 'Wall Cabinet - 12"W x 42"H x 12"D',
    width: 12, height: 42, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 236, LG: 243, SN: 251, MW: 251, EB: 272, EW: 272, ES: 272 },
    notes: 'Single door. Three adjustable shelves. Specify hinge left or right.',
  },
  {
    sku: 'W1542', category: 'wall_42h_1door', categoryLabel: 'Wall Cabinet 42"H - 1 Door',
    description: 'Wall Cabinet - 15"W x 42"H x 12"D',
    width: 15, height: 42, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 272, LG: 280, SN: 289, MW: 289, EB: 313, EW: 313, ES: 313 },
    notes: 'Single door. Three adjustable shelves. Specify hinge left or right.',
  },
  {
    sku: 'W1842', category: 'wall_42h_1door', categoryLabel: 'Wall Cabinet 42"H - 1 Door',
    description: 'Wall Cabinet - 18"W x 42"H x 12"D',
    width: 18, height: 42, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 309, LG: 319, SN: 329, MW: 329, EB: 356, EW: 356, ES: 356 },
    notes: 'Single door. Three adjustable shelves. Specify hinge left or right.',
  },
  {
    sku: 'W2142', category: 'wall_42h_1door', categoryLabel: 'Wall Cabinet 42"H - 1 Door',
    description: 'Wall Cabinet - 21"W x 42"H x 12"D',
    width: 21, height: 42, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 346, LG: 357, SN: 368, MW: 368, EB: 398, EW: 398, ES: 398 },
    notes: 'Single door. Three adjustable shelves. Specify hinge left or right.',
  },
];

// ---- Wall Cabinets 42"H - 2 Doors ----
const WALL_42H_2DOOR: KccProduct[] = [
  {
    sku: 'W2442', category: 'wall_42h_2door', categoryLabel: 'Wall Cabinet 42"H - 2 Doors',
    description: 'Wall Cabinet - 24"W x 42"H x 12"D',
    width: 24, height: 42, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 390, LG: 402, SN: 414, MW: 414, EB: 449, EW: 449, ES: 449 },
    notes: 'Two doors. Three adjustable shelves.',
  },
  {
    sku: 'W2742', category: 'wall_42h_2door', categoryLabel: 'Wall Cabinet 42"H - 2 Doors',
    description: 'Wall Cabinet - 27"W x 42"H x 12"D',
    width: 27, height: 42, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 426, LG: 439, SN: 452, MW: 452, EB: 490, EW: 490, ES: 490 },
    notes: 'Two doors. Three adjustable shelves.',
  },
  {
    sku: 'W3042', category: 'wall_42h_2door', categoryLabel: 'Wall Cabinet 42"H - 2 Doors',
    description: 'Wall Cabinet - 30"W x 42"H x 12"D',
    width: 30, height: 42, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 490, LG: 505, SN: 520, MW: 520, EB: 563, EW: 563, ES: 563 },
    notes: 'Two doors. Three adjustable shelves.',
  },
  {
    sku: 'W3342', category: 'wall_42h_2door', categoryLabel: 'Wall Cabinet 42"H - 2 Doors',
    description: 'Wall Cabinet - 33"W x 42"H x 12"D',
    width: 33, height: 42, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 521, LG: 536, SN: 552, MW: 552, EB: 599, EW: 599, ES: 599 },
    notes: 'Two doors. Three adjustable shelves.',
  },
  {
    sku: 'W3642', category: 'wall_42h_2door', categoryLabel: 'Wall Cabinet 42"H - 2 Doors',
    description: 'Wall Cabinet - 36"W x 42"H x 12"D',
    width: 36, height: 42, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 553, LG: 570, SN: 587, MW: 587, EB: 637, EW: 637, ES: 637 },
    notes: 'Two doors. Three adjustable shelves.',
  },
  {
    sku: 'W3942', category: 'wall_42h_2door', categoryLabel: 'Wall Cabinet 42"H - 2 Doors',
    description: 'Wall Cabinet - 39"W x 42"H x 12"D',
    width: 39, height: 42, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 611, LG: 629, SN: 647, MW: 647, EB: 702, EW: 702, ES: 702 },
    notes: 'Two doors. Three adjustable shelves.',
  },
  {
    sku: 'W4242', category: 'wall_42h_2door', categoryLabel: 'Wall Cabinet 42"H - 2 Doors',
    description: 'Wall Cabinet - 42"W x 42"H x 12"D',
    width: 42, height: 42, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 648, LG: 668, SN: 690, MW: 690, EB: 746, EW: 746, ES: 746 },
    notes: 'Two doors. Three adjustable shelves.',
  },
];

// ---- Diagonal Corner Wall 12"D - 1 Door ----
const DIAGONAL_CORNER_WALL_12D: KccProduct[] = [
  {
    sku: 'DCW2418', category: 'diagonal_corner_wall', categoryLabel: 'Diagonal Corner Wall 12"D - 1 Door',
    description: 'Diagonal Corner Wall Cabinet - 24"W x 18"H x 12"D',
    width: 24, height: 18, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 354, LG: 357, SN: 375, MW: 458, EB: 407, EW: 407, ES: 407 },
    notes: 'Diagonal corner wall. Requires 24" on each wall. Single door.',
  },
  {
    sku: 'DCW2430', category: 'diagonal_corner_wall', categoryLabel: 'Diagonal Corner Wall 12"D - 1 Door',
    description: 'Diagonal Corner Wall Cabinet - 24"W x 30"H x 12"D',
    width: 24, height: 30, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 397, LG: 409, SN: 422, MW: 422, EB: 456, EW: 456, ES: 456 },
    notes: 'Diagonal corner wall. Requires 24" on each wall. Single door.',
  },
  {
    sku: 'DCW2436', category: 'diagonal_corner_wall', categoryLabel: 'Diagonal Corner Wall 12"D - 1 Door',
    description: 'Diagonal Corner Wall Cabinet - 24"W x 36"H x 12"D',
    width: 24, height: 36, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 452, LG: 466, SN: 480, MW: 480, EB: 520, EW: 520, ES: 520 },
    notes: 'Diagonal corner wall. Requires 24" on each wall. Single door.',
  },
  {
    sku: 'DCW2442', category: 'diagonal_corner_wall', categoryLabel: 'Diagonal Corner Wall 12"D - 1 Door',
    description: 'Diagonal Corner Wall Cabinet - 24"W x 42"H x 12"D',
    width: 24, height: 42, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 544, LG: 560, SN: 577, MW: 577, EB: 625, EW: 625, ES: 625 },
    notes: 'Diagonal corner wall. Requires 24" on each wall. Single door.',
  },
];

// ---- Diagonal Corner Wall 15"D - 1 Door ----
const DIAGONAL_CORNER_WALL_15D: KccProduct[] = [
  {
    sku: 'DCW2736', category: 'diagonal_corner_wall_15d', categoryLabel: 'Diagonal Corner Wall 15"D - 1 Door',
    description: 'Diagonal Corner Wall Cabinet - 27"W x 36"H x 15"D',
    width: 27, height: 36, depth: 15, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 492, LG: 490, SN: 521, MW: 521, EB: 565, EW: 565, ES: 565 },
    notes: 'Diagonal corner wall 15" deep. Requires 27" on each wall. Single door.',
  },
  {
    sku: 'DCW2742', category: 'diagonal_corner_wall_15d', categoryLabel: 'Diagonal Corner Wall 15"D - 1 Door',
    description: 'Diagonal Corner Wall Cabinet - 27"W x 42"H x 15"D',
    width: 27, height: 42, depth: 15, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 577, LG: 594, SN: 613, MW: 613, EB: 664, EW: 664, ES: 664 },
    notes: 'Diagonal corner wall 15" deep. Requires 27" on each wall. Single door.',
  },
];

// ---- Wall Easy Reach Cabinets - Bifold Door ----
const WALL_EASY_REACH: KccProduct[] = [
  {
    sku: 'WER2430', category: 'wall_easy_reach', categoryLabel: 'Wall Easy Reach Cabinet - Bifold Door',
    description: 'Wall Easy Reach Cabinet - 24"W x 30"H x 12"D',
    width: 24, height: 30, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 495, LG: 510, SN: 600, MW: 600, EB: 570, EW: 570, ES: 570 },
    notes: 'Bifold door corner wall cabinet. Requires 24" on each wall.',
  },
  {
    sku: 'WER2436', category: 'wall_easy_reach', categoryLabel: 'Wall Easy Reach Cabinet - Bifold Door',
    description: 'Wall Easy Reach Cabinet - 24"W x 36"H x 12"D',
    width: 24, height: 36, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 564, LG: 582, SN: 684, MW: 684, EB: 648, EW: 648, ES: 648 },
    notes: 'Bifold door corner wall cabinet. Requires 24" on each wall.',
  },
  {
    sku: 'WER2442', category: 'wall_easy_reach', categoryLabel: 'Wall Easy Reach Cabinet - Bifold Door',
    description: 'Wall Easy Reach Cabinet - 24"W x 42"H x 12"D',
    width: 24, height: 42, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 680, LG: 700, SN: 721, MW: 721, EB: 781, EW: 781, ES: 781 },
    notes: 'Bifold door corner wall cabinet. Requires 24" on each wall.',
  },
];

// ---- Wall Blind Corner 30"H - 1 Door ----
const WALL_BLIND_CORNER_30H: KccProduct[] = [
  {
    sku: 'WBC2730', category: 'wall_blind_corner_30h', categoryLabel: 'Wall Blind Corner 30"H - 1 Door',
    description: 'Wall Blind Corner Cabinet - 27"W x 30"H x 12"D',
    width: 27, height: 30, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 309, LG: 319, SN: 329, MW: 329, EB: 356, EW: 356, ES: 356 },
    notes: 'Blind corner wall. Filler required.',
  },
  {
    sku: 'WBC3030', category: 'wall_blind_corner_30h', categoryLabel: 'Wall Blind Corner 30"H - 1 Door',
    description: 'Wall Blind Corner Cabinet - 30"W x 30"H x 12"D',
    width: 30, height: 30, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 377, LG: 388, SN: 400, MW: 400, EB: 434, EW: 434, ES: 434 },
    notes: 'Blind corner wall. Filler required.',
  },
  {
    sku: 'WBC3630', category: 'wall_blind_corner_30h', categoryLabel: 'Wall Blind Corner 30"H - 1 Door',
    description: 'Wall Blind Corner Cabinet - 36"W x 30"H x 12"D (fits 33")',
    width: 36, height: 30, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 421, LG: 434, SN: 447, MW: 447, EB: 483, EW: 483, ES: 483 },
    notes: 'Blind corner wall. 36" body fits 33" opening. Filler required.',
  },
];

// ---- Wall Blind Corner 36"H - 1 Door ----
const WALL_BLIND_CORNER_36H: KccProduct[] = [
  {
    sku: 'WBC2736', category: 'wall_blind_corner_36h', categoryLabel: 'Wall Blind Corner 36"H - 1 Door',
    description: 'Wall Blind Corner Cabinet - 27"W x 36"H x 12"D',
    width: 27, height: 36, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 359, LG: 370, SN: 381, MW: 381, EB: 413, EW: 413, ES: 413 },
    notes: 'Blind corner wall. Filler required.',
  },
  {
    sku: 'WBC3036', category: 'wall_blind_corner_36h', categoryLabel: 'Wall Blind Corner 36"H - 1 Door',
    description: 'Wall Blind Corner Cabinet - 30"W x 36"H x 12"D',
    width: 30, height: 36, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 426, LG: 439, SN: 452, MW: 452, EB: 490, EW: 490, ES: 490 },
    notes: 'Blind corner wall. Filler required.',
  },
  {
    sku: 'WBC3636', category: 'wall_blind_corner_36h', categoryLabel: 'Wall Blind Corner 36"H - 1 Door',
    description: 'Wall Blind Corner Cabinet - 36"W x 36"H x 12"D',
    width: 36, height: 36, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 479, LG: 493, SN: 508, MW: 508, EB: 550, EW: 550, ES: 550 },
    notes: 'Blind corner wall. Filler required.',
  },
];

// ---- Wall Blind Corner 42"H - 1 Door ----
const WALL_BLIND_CORNER_42H: KccProduct[] = [
  {
    sku: 'WBC2742', category: 'wall_blind_corner_42h', categoryLabel: 'Wall Blind Corner 42"H - 1 Door',
    description: 'Wall Blind Corner Cabinet - 27"W x 42"H x 12"D',
    width: 27, height: 42, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 426, LG: 439, SN: 452, MW: 452, EB: 490, EW: 490, ES: 490 },
    notes: 'Blind corner wall. Filler required.',
  },
  {
    sku: 'WBC3042', category: 'wall_blind_corner_42h', categoryLabel: 'Wall Blind Corner 42"H - 1 Door',
    description: 'Wall Blind Corner Cabinet - 30"W x 42"H x 12"D',
    width: 30, height: 42, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 497, LG: 512, SN: 528, MW: 528, EB: 572, EW: 572, ES: 572 },
    notes: 'Blind corner wall. Filler required.',
  },
  {
    sku: 'WBC3642', category: 'wall_blind_corner_42h', categoryLabel: 'Wall Blind Corner 42"H - 1 Door',
    description: 'Wall Blind Corner Cabinet - 36"W x 42"H x 12"D',
    width: 36, height: 42, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 553, LG: 570, SN: 587, MW: 587, EB: 637, EW: 637, ES: 637 },
    notes: 'Blind corner wall. Filler required.',
  },
];

// ---- Wall Cabinets 12"H - 2 Doors ----
const WALL_12H_2DOOR: KccProduct[] = [
  {
    sku: 'W2412', category: 'wall_12h_2door', categoryLabel: 'Wall Cabinet 12"H - 2 Doors',
    description: 'Wall Cabinet - 24"W x 12"H x 12"D',
    width: 24, height: 12, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 143, LG: 147, SN: 152, MW: 152, EB: 165, EW: 165, ES: 165 },
    notes: 'Over-appliance or stacker cabinet. Two doors, no shelves.',
  },
  {
    sku: 'W3012', category: 'wall_12h_2door', categoryLabel: 'Wall Cabinet 12"H - 2 Doors',
    description: 'Wall Cabinet - 30"W x 12"H x 12"D',
    width: 30, height: 12, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 201, LG: 208, SN: 214, MW: 214, EB: 232, EW: 232, ES: 232 },
    notes: 'Over-appliance or stacker cabinet. Two doors, no shelves.',
  },
  {
    sku: 'W3312', category: 'wall_12h_2door', categoryLabel: 'Wall Cabinet 12"H - 2 Doors',
    description: 'Wall Cabinet - 33"W x 12"H x 12"D',
    width: 33, height: 12, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 214, LG: 221, SN: 227, MW: 227, EB: 247, EW: 247, ES: 247 },
    notes: 'Over-appliance or stacker cabinet. Two doors, no shelves.',
  },
  {
    sku: 'W3612', category: 'wall_12h_2door', categoryLabel: 'Wall Cabinet 12"H - 2 Doors',
    description: 'Wall Cabinet - 36"W x 12"H x 12"D',
    width: 36, height: 12, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 228, LG: 235, SN: 242, MW: 242, EB: 263, EW: 263, ES: 263 },
    notes: 'Over-appliance or stacker cabinet. Two doors, no shelves.',
  },
];

// ---- Wall Cabinets 15"H - 2 Doors ----
const WALL_15H_2DOOR: KccProduct[] = [
  {
    sku: 'W2415', category: 'wall_15h_2door', categoryLabel: 'Wall Cabinet 15"H - 2 Doors',
    description: 'Wall Cabinet - 24"W x 15"H x 12"D',
    width: 24, height: 15, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 206, LG: 212, SN: 216, MW: 216, EB: 237, EW: 237, ES: 237 },
    notes: 'Over-appliance or stacker cabinet. Two doors, one shelf.',
  },
  {
    sku: 'W3015', category: 'wall_15h_2door', categoryLabel: 'Wall Cabinet 15"H - 2 Doors',
    description: 'Wall Cabinet - 30"W x 15"H x 12"D',
    width: 30, height: 15, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 223, LG: 229, SN: 237, MW: 237, EB: 256, EW: 256, ES: 256 },
    notes: 'Over-appliance or stacker cabinet. Two doors, one shelf.',
  },
  {
    sku: 'W3315', category: 'wall_15h_2door', categoryLabel: 'Wall Cabinet 15"H - 2 Doors',
    description: 'Wall Cabinet - 33"W x 15"H x 12"D',
    width: 33, height: 15, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 237, LG: 245, SN: 252, MW: 252, EB: 273, EW: 273, ES: 273 },
    notes: 'Over-appliance or stacker cabinet. Two doors, one shelf.',
  },
  {
    sku: 'W3615', category: 'wall_15h_2door', categoryLabel: 'Wall Cabinet 15"H - 2 Doors',
    description: 'Wall Cabinet - 36"W x 15"H x 12"D',
    width: 36, height: 15, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 251, LG: 259, SN: 266, MW: 266, EB: 289, EW: 289, ES: 289 },
    notes: 'Over-appliance or stacker cabinet. Two doors, one shelf.',
  },
];

// ---- Wall Cabinets 18"H - 1 Door ----
const WALL_18H_1DOOR: KccProduct[] = [
  {
    sku: 'W1218', category: 'wall_18h_1door', categoryLabel: 'Wall Cabinet 18"H - 1 Door',
    description: 'Wall Cabinet - 12"W x 18"H x 12"D',
    width: 12, height: 18, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 160, LG: 165, SN: 170, MW: 170, EB: 184, EW: 184, ES: 184 },
    notes: 'Single door. One adjustable shelf. Specify hinge left or right.',
  },
  {
    sku: 'W1518', category: 'wall_18h_1door', categoryLabel: 'Wall Cabinet 18"H - 1 Door',
    description: 'Wall Cabinet - 15"W x 18"H x 12"D',
    width: 15, height: 18, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 185, LG: 187, SN: 196, MW: 196, EB: 213, EW: 213, ES: 213 },
    notes: 'Single door. One adjustable shelf. Specify hinge left or right.',
  },
  {
    sku: 'W1818', category: 'wall_18h_1door', categoryLabel: 'Wall Cabinet 18"H - 1 Door',
    description: 'Wall Cabinet - 18"W x 18"H x 12"D',
    width: 18, height: 18, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 208, LG: 214, SN: 220, MW: 220, EB: 239, EW: 239, ES: 239 },
    notes: 'Single door. One adjustable shelf. Specify hinge left or right.',
  },
  {
    sku: 'W2118', category: 'wall_18h_1door', categoryLabel: 'Wall Cabinet 18"H - 1 Door',
    description: 'Wall Cabinet - 21"W x 18"H x 12"D',
    width: 21, height: 18, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 225, LG: 219, SN: 238, MW: 238, EB: 259, EW: 259, ES: 259 },
    notes: 'Single door. One adjustable shelf. Specify hinge left or right.',
  },
];

// ---- Wall Cabinets 18"H - 2 Doors ----
const WALL_18H_2DOOR: KccProduct[] = [
  {
    sku: 'W2418', category: 'wall_18h_2door', categoryLabel: 'Wall Cabinet 18"H - 2 Doors',
    description: 'Wall Cabinet - 24"W x 18"H x 12"D',
    width: 24, height: 18, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 236, LG: 243, SN: 250, MW: 250, EB: 272, EW: 272, ES: 272 },
    notes: 'Two doors. One adjustable shelf.',
  },
  {
    sku: 'W2718', category: 'wall_18h_2door', categoryLabel: 'Wall Cabinet 18"H - 2 Doors',
    description: 'Wall Cabinet - 27"W x 18"H x 12"D',
    width: 27, height: 18, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 299, LG: 249, SN: 317, MW: 317, EB: 343, EW: 343, ES: 343 },
    notes: 'Two doors. One adjustable shelf.',
  },
  {
    sku: 'W3018', category: 'wall_18h_2door', categoryLabel: 'Wall Cabinet 18"H - 2 Doors',
    description: 'Wall Cabinet - 30"W x 18"H x 12"D',
    width: 30, height: 18, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 252, LG: 260, SN: 267, MW: 267, EB: 290, EW: 290, ES: 290 },
    notes: 'Two doors. One adjustable shelf.',
  },
  {
    sku: 'W3318', category: 'wall_18h_2door', categoryLabel: 'Wall Cabinet 18"H - 2 Doors',
    description: 'Wall Cabinet - 33"W x 18"H x 12"D',
    width: 33, height: 18, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 260, LG: 267, SN: 276, MW: 276, EB: 299, EW: 299, ES: 299 },
    notes: 'Two doors. One adjustable shelf.',
  },
  {
    sku: 'W3618', category: 'wall_18h_2door', categoryLabel: 'Wall Cabinet 18"H - 2 Doors',
    description: 'Wall Cabinet - 36"W x 18"H x 12"D',
    width: 36, height: 18, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 269, LG: 277, SN: 286, MW: 286, EB: 309, EW: 309, ES: 309 },
    notes: 'Two doors. One adjustable shelf.',
  },
];

// ---- Wall Cabinets 24"H - 2 Doors ----
const WALL_24H_2DOOR: KccProduct[] = [
  {
    sku: 'W2424', category: 'wall_24h_2door', categoryLabel: 'Wall Cabinet 24"H - 2 Doors',
    description: 'Wall Cabinet - 24"W x 24"H x 12"D',
    width: 24, height: 24, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 304, LG: 313, SN: 322, MW: 322, EB: 349, EW: 349, ES: 349 },
    notes: 'Two doors. One adjustable shelf.',
  },
  {
    sku: 'W3024', category: 'wall_24h_2door', categoryLabel: 'Wall Cabinet 24"H - 2 Doors',
    description: 'Wall Cabinet - 30"W x 24"H x 12"D',
    width: 30, height: 24, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 304, LG: 313, SN: 322, MW: 322, EB: 349, EW: 349, ES: 349 },
    notes: 'Two doors. One adjustable shelf.',
  },
  {
    sku: 'W3324', category: 'wall_24h_2door', categoryLabel: 'Wall Cabinet 24"H - 2 Doors',
    description: 'Wall Cabinet - 33"W x 24"H x 12"D',
    width: 33, height: 24, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 312, LG: 321, SN: 331, MW: 331, EB: 358, EW: 358, ES: 358 },
    notes: 'Two doors. One adjustable shelf.',
  },
  {
    sku: 'W3624', category: 'wall_24h_2door', categoryLabel: 'Wall Cabinet 24"H - 2 Doors',
    description: 'Wall Cabinet - 36"W x 24"H x 12"D',
    width: 36, height: 24, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 335, LG: 345, SN: 356, MW: 356, EB: 386, EW: 386, ES: 386 },
    notes: 'Two doors. One adjustable shelf.',
  },
];

// ---- Wall Refrigerator Cabinets 12"H 24"D ----
const WALL_REFRIG_12H_24D: KccProduct[] = [
  {
    sku: 'W301224', category: 'wall_12h_24d_2door', categoryLabel: 'Wall Refrigerator Cabinet 12"H 24"D',
    description: 'Wall Refrigerator Cabinet - 30"W x 12"H x 24"D',
    width: 30, height: 12, depth: 24, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 262, LG: 269, SN: 278, MW: 278, EB: 301, EW: 301, ES: 301 },
    notes: 'Deep wall cabinet for above refrigerator. 24" depth.',
  },
  {
    sku: 'W331224', category: 'wall_12h_24d_2door', categoryLabel: 'Wall Refrigerator Cabinet 12"H 24"D',
    description: 'Wall Refrigerator Cabinet - 33"W x 12"H x 24"D',
    width: 33, height: 12, depth: 24, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 276, LG: 285, SN: 293, MW: 293, EB: 317, EW: 317, ES: 317 },
    notes: 'Deep wall cabinet for above refrigerator. 24" depth.',
  },
  {
    sku: 'W361224', category: 'wall_12h_24d_2door', categoryLabel: 'Wall Refrigerator Cabinet 12"H 24"D',
    description: 'Wall Refrigerator Cabinet - 36"W x 12"H x 24"D',
    width: 36, height: 12, depth: 24, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 290, LG: 299, SN: 308, MW: 308, EB: 333, EW: 333, ES: 333 },
    notes: 'Deep wall cabinet for above refrigerator. 24" depth.',
  },
];

// ---- Wall Refrigerator Cabinets 15"H 24"D ----
const WALL_REFRIG_15H_24D: KccProduct[] = [
  {
    sku: 'W301524', category: 'wall_15h_24d_2door', categoryLabel: 'Wall Refrigerator Cabinet 15"H 24"D',
    description: 'Wall Refrigerator Cabinet - 30"W x 15"H x 24"D',
    width: 30, height: 15, depth: 24, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 285, LG: 293, SN: 302, MW: 302, EB: 327, EW: 327, ES: 327 },
    notes: 'Deep wall cabinet for above refrigerator. 24" depth.',
  },
  {
    sku: 'W331524', category: 'wall_15h_24d_2door', categoryLabel: 'Wall Refrigerator Cabinet 15"H 24"D',
    description: 'Wall Refrigerator Cabinet - 33"W x 15"H x 24"D',
    width: 33, height: 15, depth: 24, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 299, LG: 307, SN: 317, MW: 317, EB: 343, EW: 343, ES: 343 },
    notes: 'Deep wall cabinet for above refrigerator. 24" depth.',
  },
  {
    sku: 'W361524', category: 'wall_15h_24d_2door', categoryLabel: 'Wall Refrigerator Cabinet 15"H 24"D',
    description: 'Wall Refrigerator Cabinet - 36"W x 15"H x 24"D',
    width: 36, height: 15, depth: 24, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 316, LG: 326, SN: 335, MW: 335, EB: 363, EW: 363, ES: 363 },
    notes: 'Deep wall cabinet for above refrigerator. 24" depth.',
  },
];

// ---- Wall Refrigerator Cabinets 18"H 24"D ----
const WALL_REFRIG_18H_24D: KccProduct[] = [
  {
    sku: 'W301824', category: 'wall_18h_24d_2door', categoryLabel: 'Wall Refrigerator Cabinet 18"H 24"D',
    description: 'Wall Refrigerator Cabinet - 30"W x 18"H x 24"D',
    width: 30, height: 18, depth: 24, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 317, LG: 327, SN: 336, MW: 336, EB: 364, EW: 364, ES: 364 },
    notes: 'Deep wall cabinet for above refrigerator. 24" depth.',
  },
  {
    sku: 'W331824', category: 'wall_18h_24d_2door', categoryLabel: 'Wall Refrigerator Cabinet 18"H 24"D',
    description: 'Wall Refrigerator Cabinet - 33"W x 18"H x 24"D',
    width: 33, height: 18, depth: 24, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 324, LG: 334, SN: 344, MW: 344, EB: 373, EW: 373, ES: 373 },
    notes: 'Deep wall cabinet for above refrigerator. 24" depth.',
  },
  {
    sku: 'W361824', category: 'wall_18h_24d_2door', categoryLabel: 'Wall Refrigerator Cabinet 18"H 24"D',
    description: 'Wall Refrigerator Cabinet - 36"W x 18"H x 24"D',
    width: 36, height: 18, depth: 24, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 331, LG: 341, SN: 351, MW: 351, EB: 381, EW: 381, ES: 381 },
    notes: 'Deep wall cabinet for above refrigerator. 24" depth.',
  },
];

// ---- Wall Refrigerator Cabinets 24"H 24"D ----
const WALL_REFRIG_24H_24D: KccProduct[] = [
  {
    sku: 'W302424', category: 'wall_24h_24d_2door', categoryLabel: 'Wall Refrigerator Cabinet 24"H 24"D',
    description: 'Wall Refrigerator Cabinet - 30"W x 24"H x 24"D',
    width: 30, height: 24, depth: 24, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 382, LG: 394, SN: 405, MW: 405, EB: 439, EW: 439, ES: 439 },
    notes: 'Deep wall cabinet for above refrigerator. 24" depth.',
  },
  {
    sku: 'W332424', category: 'wall_24h_24d_2door', categoryLabel: 'Wall Refrigerator Cabinet 24"H 24"D',
    description: 'Wall Refrigerator Cabinet - 33"W x 24"H x 24"D',
    width: 33, height: 24, depth: 24, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 414, LG: 426, SN: 439, MW: 439, EB: 476, EW: 476, ES: 476 },
    notes: 'Deep wall cabinet for above refrigerator. 24" depth.',
  },
  {
    sku: 'W362424', category: 'wall_24h_24d_2door', categoryLabel: 'Wall Refrigerator Cabinet 24"H 24"D',
    description: 'Wall Refrigerator Cabinet - 36"W x 24"H x 24"D',
    width: 36, height: 24, depth: 24, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 443, LG: 456, SN: 470, MW: 470, EB: 510, EW: 510, ES: 510 },
    notes: 'Deep wall cabinet for above refrigerator. 24" depth.',
  },
];

// ---- Wall Glass 30"H - 1 Routed ----
const WALL_GLASS_30H_1ROUTED: KccProduct[] = [
  {
    sku: 'W1530GD', category: 'wall_glass_30h_1routed', categoryLabel: 'Wall Glass 30"H - 1 Routed Door',
    description: 'Wall Glass Door Cabinet - 15"W x 30"H x 12"D',
    width: 15, height: 30, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 229, LG: 236, SN: 243, MW: 243, EB: 264, EW: 264, ES: 264 },
    notes: 'Routed for glass insert (glass sold separately). Specify hinge left or right.',
  },
  {
    sku: 'W1830GD', category: 'wall_glass_30h_1routed', categoryLabel: 'Wall Glass 30"H - 1 Routed Door',
    description: 'Wall Glass Door Cabinet - 18"W x 30"H x 12"D',
    width: 18, height: 30, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 272, LG: 280, SN: 289, MW: 289, EB: 313, EW: 313, ES: 313 },
    notes: 'Routed for glass insert (glass sold separately). Specify hinge left or right.',
  },
];

// ---- Wall Glass 30"H - 2 Routed ----
const WALL_GLASS_30H_2ROUTED: KccProduct[] = [
  {
    sku: 'W2430GD', category: 'wall_glass_30h_2routed', categoryLabel: 'Wall Glass 30"H - 2 Routed Doors',
    description: 'Wall Glass Door Cabinet - 24"W x 30"H x 12"D',
    width: 24, height: 30, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 349, LG: 360, SN: 371, MW: 371, EB: 401, EW: 401, ES: 401 },
    notes: 'Two doors routed for glass inserts (glass sold separately).',
  },
  {
    sku: 'W3030GD', category: 'wall_glass_30h_2routed', categoryLabel: 'Wall Glass 30"H - 2 Routed Doors',
    description: 'Wall Glass Door Cabinet - 30"W x 30"H x 12"D',
    width: 30, height: 30, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 414, LG: 426, SN: 439, MW: 439, EB: 476, EW: 476, ES: 476 },
    notes: 'Two doors routed for glass inserts (glass sold separately).',
  },
  {
    sku: 'W3630GD', category: 'wall_glass_30h_2routed', categoryLabel: 'Wall Glass 30"H - 2 Routed Doors',
    description: 'Wall Glass Door Cabinet - 36"W x 30"H x 12"D',
    width: 36, height: 30, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 475, LG: 489, SN: 536, MW: 536, EB: 546, EW: 546, ES: 546 },
    notes: 'Two doors routed for glass inserts (glass sold separately).',
  },
];

// ---- Wall Glass 36"H - 1 Routed ----
const WALL_GLASS_36H_1ROUTED: KccProduct[] = [
  {
    sku: 'W1536GD', category: 'wall_glass_36h_1routed', categoryLabel: 'Wall Glass 36"H - 1 Routed Door',
    description: 'Wall Glass Door Cabinet - 15"W x 36"H x 12"D',
    width: 15, height: 36, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 261, LG: 268, SN: 277, MW: 277, EB: 300, EW: 300, ES: 300 },
    notes: 'Routed for glass insert (glass sold separately). Specify hinge left or right.',
  },
  {
    sku: 'W1836GD', category: 'wall_glass_36h_1routed', categoryLabel: 'Wall Glass 36"H - 1 Routed Door',
    description: 'Wall Glass Door Cabinet - 18"W x 36"H x 12"D',
    width: 18, height: 36, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 340, LG: 349, SN: 360, MW: 360, EB: 390, EW: 390, ES: 390 },
    notes: 'Routed for glass insert (glass sold separately). Specify hinge left or right.',
  },
];

// ---- Wall Glass 36"H - 2 Routed ----
const WALL_GLASS_36H_2ROUTED: KccProduct[] = [
  {
    sku: 'W2436GD', category: 'wall_glass_36h_2routed', categoryLabel: 'Wall Glass 36"H - 2 Routed Doors',
    description: 'Wall Glass Door Cabinet - 24"W x 36"H x 12"D',
    width: 24, height: 36, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 363, LG: 374, SN: 386, MW: 386, EB: 417, EW: 417, ES: 417 },
    notes: 'Two doors routed for glass inserts (glass sold separately).',
  },
  {
    sku: 'W3036GD', category: 'wall_glass_36h_2routed', categoryLabel: 'Wall Glass 36"H - 2 Routed Doors',
    description: 'Wall Glass Door Cabinet - 30"W x 36"H x 12"D',
    width: 30, height: 36, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 480, LG: 494, SN: 509, MW: 438, EB: 552, EW: 552, ES: 552 },
    notes: 'Two doors routed for glass inserts (glass sold separately).',
  },
  {
    sku: 'W3636GD', category: 'wall_glass_36h_2routed', categoryLabel: 'Wall Glass 36"H - 2 Routed Doors',
    description: 'Wall Glass Door Cabinet - 36"W x 36"H x 12"D',
    width: 36, height: 36, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 522, LG: 537, SN: 553, MW: 553, EB: 600, EW: 600, ES: 600 },
    notes: 'Two doors routed for glass inserts (glass sold separately).',
  },
];

// ---- Wall Glass 42"H - 1 Routed ----
const WALL_GLASS_42H_1ROUTED: KccProduct[] = [
  {
    sku: 'W1542GD', category: 'wall_glass_42h_1routed', categoryLabel: 'Wall Glass 42"H - 1 Routed Door',
    description: 'Wall Glass Door Cabinet - 15"W x 42"H x 12"D',
    width: 15, height: 42, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 301, LG: 309, SN: 319, MW: 319, EB: 346, EW: 346, ES: 346 },
    notes: 'Routed for glass insert (glass sold separately). Specify hinge left or right.',
  },
  {
    sku: 'W1842GD', category: 'wall_glass_42h_1routed', categoryLabel: 'Wall Glass 42"H - 1 Routed Door',
    description: 'Wall Glass Door Cabinet - 18"W x 42"H x 12"D',
    width: 18, height: 42, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 356, LG: 367, SN: 377, MW: 377, EB: 409, EW: 409, ES: 409 },
    notes: 'Routed for glass insert (glass sold separately). Specify hinge left or right.',
  },
];

// ---- Wall Glass 42"H - 2 Routed ----
const WALL_GLASS_42H_2ROUTED: KccProduct[] = [
  {
    sku: 'W2442GD', category: 'wall_glass_42h_2routed', categoryLabel: 'Wall Glass 42"H - 2 Routed Doors',
    description: 'Wall Glass Door Cabinet - 24"W x 42"H x 12"D',
    width: 24, height: 42, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 431, LG: 444, SN: 457, MW: 457, EB: 496, EW: 496, ES: 496 },
    notes: 'Two doors routed for glass inserts (glass sold separately).',
  },
  {
    sku: 'W3042GD', category: 'wall_glass_42h_2routed', categoryLabel: 'Wall Glass 42"H - 2 Routed Doors',
    description: 'Wall Glass Door Cabinet - 30"W x 42"H x 12"D',
    width: 30, height: 42, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 549, LG: 565, SN: 583, MW: 583, EB: 631, EW: 631, ES: 631 },
    notes: 'Two doors routed for glass inserts (glass sold separately).',
  },
  {
    sku: 'W3642GD', category: 'wall_glass_42h_2routed', categoryLabel: 'Wall Glass 42"H - 2 Routed Doors',
    description: 'Wall Glass Door Cabinet - 36"W x 42"H x 12"D',
    width: 36, height: 42, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 607, LG: 626, SN: 644, MW: 644, EB: 698, EW: 698, ES: 698 },
    notes: 'Two doors routed for glass inserts (glass sold separately).',
  },
];

// ---- Diagonal Corner Wall Glass 12"D - 1 Routed ----
const DIAGONAL_CORNER_WALL_GLASS_12D: KccProduct[] = [
  {
    sku: 'DCW2412GD', category: 'diagonal_corner_wall_glass', categoryLabel: 'Diagonal Corner Wall Glass 12"D - 1 Routed',
    description: 'Diagonal Corner Wall Glass Cabinet - 24"W x 12"H x 12"D',
    width: 24, height: 12, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 185, LG: 191, SN: 197, MW: 197, EB: 213, EW: 213, ES: 213 },
    notes: 'Diagonal corner, routed for glass insert (glass sold separately).',
  },
  {
    sku: 'DCW2430GD', category: 'diagonal_corner_wall_glass', categoryLabel: 'Diagonal Corner Wall Glass 12"D - 1 Routed',
    description: 'Diagonal Corner Wall Glass Cabinet - 24"W x 30"H x 12"D',
    width: 24, height: 30, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 418, LG: 431, SN: 444, MW: 444, EB: 481, EW: 481, ES: 481 },
    notes: 'Diagonal corner, routed for glass insert (glass sold separately).',
  },
  {
    sku: 'DCW2436GD', category: 'diagonal_corner_wall_glass', categoryLabel: 'Diagonal Corner Wall Glass 12"D - 1 Routed',
    description: 'Diagonal Corner Wall Glass Cabinet - 24"W x 36"H x 12"D',
    width: 24, height: 36, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 476, LG: 490, SN: 505, MW: 505, EB: 547, EW: 547, ES: 547 },
    notes: 'Diagonal corner, routed for glass insert (glass sold separately).',
  },
  {
    sku: 'DCW2442GD', category: 'diagonal_corner_wall_glass', categoryLabel: 'Diagonal Corner Wall Glass 12"D - 1 Routed',
    description: 'Diagonal Corner Wall Glass Cabinet - 24"W x 42"H x 12"D',
    width: 24, height: 42, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 553, LG: 570, SN: 587, MW: 587, EB: 637, EW: 637, ES: 637 },
    notes: 'Diagonal corner, routed for glass insert (glass sold separately).',
  },
];

// ---- Diagonal Corner Wall Glass 15"D - 1 Routed ----
const DIAGONAL_CORNER_WALL_GLASS_15D: KccProduct[] = [
  {
    sku: 'DCW2712GD', category: 'diagonal_corner_wall_glass_15d', categoryLabel: 'Diagonal Corner Wall Glass 15"D - 1 Routed',
    description: 'Diagonal Corner Wall Glass Cabinet - 27"W x 12"H x 15"D',
    width: 27, height: 12, depth: 15, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 198, LG: 204, SN: 210, MW: 210, EB: 227, EW: 227, ES: 227 },
    notes: 'Diagonal corner 15" deep, routed for glass insert (glass sold separately).',
  },
  {
    sku: 'DCW2736GD', category: 'diagonal_corner_wall_glass_15d', categoryLabel: 'Diagonal Corner Wall Glass 15"D - 1 Routed',
    description: 'Diagonal Corner Wall Glass Cabinet - 27"W x 36"H x 15"D',
    width: 27, height: 36, depth: 15, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 524, LG: 563, SN: 556, MW: 556, EB: 603, EW: 603, ES: 603 },
    notes: 'Diagonal corner 15" deep, routed for glass insert (glass sold separately).',
  },
  {
    sku: 'DCW2742GD', category: 'diagonal_corner_wall_glass_15d', categoryLabel: 'Diagonal Corner Wall Glass 15"D - 1 Routed',
    description: 'Diagonal Corner Wall Glass Cabinet - 27"W x 42"H x 15"D',
    width: 27, height: 42, depth: 15, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 611, LG: 683, SN: 647, MW: 647, EB: 702, EW: 702, ES: 702 },
    notes: 'Diagonal corner 15" deep, routed for glass insert (glass sold separately).',
  },
];

// ---- Wall Glass 12"H - 1 Routed ----
const WALL_GLASS_12H_1ROUTED: KccProduct[] = [
  {
    sku: 'W1212GD', category: 'wall_glass_12h_1routed', categoryLabel: 'Wall Glass 12"H - 1 Routed Door',
    description: 'Wall Glass Door Cabinet - 12"W x 12"H x 12"D',
    width: 12, height: 12, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 85, LG: 87, SN: 90, MW: 90, EB: 98, EW: 98, ES: 98 },
    notes: 'Routed for glass insert (glass sold separately). Specify hinge left or right.',
  },
  {
    sku: 'W1512GD', category: 'wall_glass_12h_1routed', categoryLabel: 'Wall Glass 12"H - 1 Routed Door',
    description: 'Wall Glass Door Cabinet - 15"W x 12"H x 12"D',
    width: 15, height: 12, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 96, LG: 99, SN: 102, MW: 102, EB: 110, EW: 110, ES: 110 },
    notes: 'Routed for glass insert (glass sold separately). Specify hinge left or right.',
  },
  {
    sku: 'W1812GD', category: 'wall_glass_12h_1routed', categoryLabel: 'Wall Glass 12"H - 1 Routed Door',
    description: 'Wall Glass Door Cabinet - 18"W x 12"H x 12"D',
    width: 18, height: 12, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 107, LG: 111, SN: 114, MW: 114, EB: 124, EW: 124, ES: 124 },
    notes: 'Routed for glass insert (glass sold separately). Specify hinge left or right.',
  },
  {
    sku: 'W2112GD', category: 'wall_glass_12h_1routed', categoryLabel: 'Wall Glass 12"H - 1 Routed Door',
    description: 'Wall Glass Door Cabinet - 21"W x 12"H x 12"D',
    width: 21, height: 12, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 119, LG: 123, SN: 127, MW: 127, EB: 138, EW: 138, ES: 138 },
    notes: 'Routed for glass insert (glass sold separately). Specify hinge left or right.',
  },
];

// ---- Wall Glass 12"H - 2 Routed ----
const WALL_GLASS_12H_2ROUTED: KccProduct[] = [
  {
    sku: 'W2412GD', category: 'wall_glass_12h_2routed', categoryLabel: 'Wall Glass 12"H - 2 Routed Doors',
    description: 'Wall Glass Door Cabinet - 24"W x 12"H x 12"D',
    width: 24, height: 12, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 143, LG: 147, SN: 152, MW: 152, EB: 165, EW: 165, ES: 165 },
    notes: 'Two doors routed for glass inserts (glass sold separately).',
  },
  {
    sku: 'W2712GD', category: 'wall_glass_12h_2routed', categoryLabel: 'Wall Glass 12"H - 2 Routed Doors',
    description: 'Wall Glass Door Cabinet - 27"W x 12"H x 12"D',
    width: 27, height: 12, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 154, LG: 158, SN: 164, MW: 164, EB: 177, EW: 177, ES: 177 },
    notes: 'Two doors routed for glass inserts (glass sold separately).',
  },
  {
    sku: 'W3012GD', category: 'wall_glass_12h_2routed', categoryLabel: 'Wall Glass 12"H - 2 Routed Doors',
    description: 'Wall Glass Door Cabinet - 30"W x 12"H x 12"D',
    width: 30, height: 12, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 221, LG: 227, SN: 235, MW: 235, EB: 254, EW: 254, ES: 254 },
    notes: 'Two doors routed for glass inserts (glass sold separately).',
  },
  {
    sku: 'W3312GD', category: 'wall_glass_12h_2routed', categoryLabel: 'Wall Glass 12"H - 2 Routed Doors',
    description: 'Wall Glass Door Cabinet - 33"W x 12"H x 12"D',
    width: 33, height: 12, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 235, LG: 242, SN: 250, MW: 250, EB: 270, EW: 270, ES: 270 },
    notes: 'Two doors routed for glass inserts (glass sold separately).',
  },
  {
    sku: 'W3612GD', category: 'wall_glass_12h_2routed', categoryLabel: 'Wall Glass 12"H - 2 Routed Doors',
    description: 'Wall Glass Door Cabinet - 36"W x 12"H x 12"D',
    width: 36, height: 12, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 250, LG: 258, SN: 265, MW: 265, EB: 288, EW: 288, ES: 288 },
    notes: 'Two doors routed for glass inserts (glass sold separately).',
  },
];

// ---- Angled Wall Cabinets ----
const ANGLED_WALL: KccProduct[] = [
  {
    sku: 'AW1230', category: 'wall_angled', categoryLabel: 'Angled Wall Cabinet',
    description: 'Angled Wall Cabinet - 12"W x 30"H x 12"D',
    width: 12, height: 30, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 212, LG: 219, SN: 225, MW: 225, EB: 243, EW: 243, ES: 243 },
    notes: 'Angled end wall cabinet. Single door.',
  },
  {
    sku: 'AW1236', category: 'wall_angled', categoryLabel: 'Angled Wall Cabinet',
    description: 'Angled Wall Cabinet - 12"W x 36"H x 12"D',
    width: 12, height: 36, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 227, LG: 234, SN: 236, MW: 236, EB: 262, EW: 262, ES: 262 },
    notes: 'Angled end wall cabinet. Single door.',
  },
  {
    sku: 'AW1242', category: 'wall_angled', categoryLabel: 'Angled Wall Cabinet',
    description: 'Angled Wall Cabinet - 12"W x 42"H x 12"D',
    width: 12, height: 42, depth: 12, doors: 1, drawers: 0, cabinetType: 'wall',
    prices: { SW: 239, LG: 247, SN: 254, MW: 254, EB: 275, EW: 275, ES: 275 },
    notes: 'Angled end wall cabinet. Single door.',
  },
];

// ---- Wall Open Shelf Cabinets ----
const WALL_OPEN_SHELF: KccProduct[] = [
  {
    sku: 'OE630', category: 'wall_open_shelf', categoryLabel: 'Wall Open Shelf Cabinet',
    description: 'Wall Open Shelf Cabinet - 06"W x 30"H x 12"D',
    width: 6, height: 30, depth: 12, doors: 0, drawers: 0, cabinetType: 'wall',
    prices: { SW: 108, LG: 112, SN: 115, MW: 115, EB: 125, EW: 125, ES: 125 },
    notes: 'Open shelf, no doors. Three fixed shelves.',
  },
  {
    sku: 'OE636', category: 'wall_open_shelf', categoryLabel: 'Wall Open Shelf Cabinet',
    description: 'Wall Open Shelf Cabinet - 06"W x 36"H x 12"D',
    width: 6, height: 36, depth: 12, doors: 0, drawers: 0, cabinetType: 'wall',
    prices: { SW: 121, LG: 125, SN: 129, MW: 129, EB: 140, EW: 140, ES: 140 },
    notes: 'Open shelf, no doors. Three fixed shelves.',
  },
  {
    sku: 'OE642', category: 'wall_open_shelf', categoryLabel: 'Wall Open Shelf Cabinet',
    description: 'Wall Open Shelf Cabinet - 06"W x 42"H x 12"D',
    width: 6, height: 42, depth: 12, doors: 0, drawers: 0, cabinetType: 'wall',
    prices: { SW: 133, LG: 138, SN: 142, MW: 142, EB: 153, EW: 153, ES: 153 },
    notes: 'Open shelf, no doors. Four fixed shelves.',
  },
];

// ---- Wall Microwave Cabinets ----
const WALL_MICROWAVE: KccProduct[] = [
  {
    sku: 'MO3030', category: 'wall_microwave', categoryLabel: 'Wall Microwave Cabinet',
    description: 'Wall Microwave Cabinet - 30"W x 30"H x 12"D',
    width: 30, height: 30, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 466, LG: 480, SN: 494, MW: 494, EB: 536, EW: 536, ES: 536 },
    notes: 'Open compartment for microwave, cabinet doors above.',
  },
  {
    sku: 'MO3036', category: 'wall_microwave', categoryLabel: 'Wall Microwave Cabinet',
    description: 'Wall Microwave Cabinet - 30"W x 36"H x 12"D',
    width: 30, height: 36, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 538, LG: 555, SN: 571, MW: 571, EB: 619, EW: 619, ES: 619 },
    notes: 'Open compartment for microwave, cabinet doors above.',
  },
  {
    sku: 'MO3042', category: 'wall_microwave', categoryLabel: 'Wall Microwave Cabinet',
    description: 'Wall Microwave Cabinet - 30"W x 42"H x 12"D',
    width: 30, height: 42, depth: 12, doors: 2, drawers: 0, cabinetType: 'wall',
    prices: { SW: 633, LG: 653, SN: 672, MW: 672, EB: 728, EW: 728, ES: 728 },
    notes: 'Open compartment for microwave, cabinet doors above.',
  },
];

// ---- Wall Drawer Cabinets ----
const WALL_DRAWER: KccProduct[] = [
  {
    sku: 'W2D12', category: 'wall_drawer', categoryLabel: 'Wall Drawer Cabinet',
    description: 'Wall Drawer Cabinet - 12"W x 12"H x 12"D',
    width: 12, height: 12, depth: 12, doors: 0, drawers: 2, cabinetType: 'wall',
    prices: { SW: 389, LG: 401, SN: 412, MW: 412, EB: 448, EW: 448, ES: 448 },
    notes: 'Two horizontal drawers, wall-mounted.',
  },
  {
    sku: 'W2D18', category: 'wall_drawer', categoryLabel: 'Wall Drawer Cabinet',
    description: 'Wall Drawer Cabinet - 18"W x 12"H x 12"D',
    width: 18, height: 12, depth: 12, doors: 0, drawers: 2, cabinetType: 'wall',
    prices: { SW: 411, LG: 423, SN: 436, MW: 436, EB: 472, EW: 472, ES: 472 },
    notes: 'Two horizontal drawers, wall-mounted.',
  },
];

// ---- Wine Racks ----
const WINE_RACKS: KccProduct[] = [
  {
    sku: 'WXC1818', category: 'wine_rack', categoryLabel: 'Wine Rack Cabinet',
    description: 'Wine Rack X Cabinet - 18"W x 18"H x 12"D',
    width: 18, height: 18, depth: 12, doors: 0, drawers: 0, cabinetType: 'wall',
    prices: { SW: 378, LG: 323, SN: 401, MW: 401, EB: 436, EW: 436, ES: 436 },
    notes: 'X-style wine rack insert. Wall-mounted.',
  },
  {
    sku: 'WRC3018', category: 'wine_rack', categoryLabel: 'Wine Rack Cabinet',
    description: 'Wine Rack Cabinet - 30"W x 18"H x 12"D',
    width: 30, height: 18, depth: 12, doors: 0, drawers: 0, cabinetType: 'wall',
    prices: { SW: 293, LG: 302, SN: 312, MW: 312, EB: 337, EW: 337, ES: 337 },
    notes: 'Lattice wine rack. Wall-mounted.',
  },
];

// ---- Glass Stem Holders ----
const GLASS_STEAM_HOLDERS: KccProduct[] = [
  {
    sku: 'SGH30', category: 'glass_steam_holder', categoryLabel: 'Glass Stem Holder',
    description: 'Glass Stem Holder - 30"W x 12"D',
    width: 30, height: 0, depth: 12, doors: 0, drawers: 0, cabinetType: 'accessory',
    prices: { SW: 104, LG: 107, SN: 111, MW: 111, EB: 119, EW: 119, ES: 119 },
    notes: 'Under-cabinet stemware holder. Mounts beneath wall cabinet.',
  },
];

// ============================================
// TALL CABINETS
// All tall cabinets: 24"D unless noted
// ============================================

// ---- Utility Cabinets - 2 Doors ----
const UTILITY_2DOOR: KccProduct[] = [
  {
    sku: 'U188424', category: 'utility_2door', categoryLabel: 'Utility Cabinet - 2 Doors',
    description: 'Utility Cabinet - 18"W x 84"H x 24"D',
    width: 18, height: 84, depth: 24, doors: 2, drawers: 0, cabinetType: 'tall',
    prices: { SW: 858, LG: 884, SN: 910, MW: 910, EB: 987, EW: 987, ES: 0 },
    notes: 'Two full-height doors. Four adjustable shelves. Pantry cabinet.',
  },
  {
    sku: 'U189024', category: 'utility_2door', categoryLabel: 'Utility Cabinet - 2 Doors',
    description: 'Utility Cabinet - 18"W x 90"H x 24"D',
    width: 18, height: 90, depth: 24, doors: 2, drawers: 0, cabinetType: 'tall',
    prices: { SW: 886, LG: 913, SN: 940, MW: 940, EB: 1019, EW: 1019, ES: 0 },
    notes: 'Two full-height doors. Four adjustable shelves. Pantry cabinet.',
  },
  {
    sku: 'U189624', category: 'utility_2door', categoryLabel: 'Utility Cabinet - 2 Doors',
    description: 'Utility Cabinet - 18"W x 96"H x 24"D',
    width: 18, height: 96, depth: 24, doors: 2, drawers: 0, cabinetType: 'tall',
    prices: { SW: 929, LG: 957, SN: 985, MW: 985, EB: 1069, EW: 1069, ES: 0 },
    notes: 'Two full-height doors. Four adjustable shelves. Pantry cabinet.',
  },
];

// ---- Utility Cabinets - 4 Doors ----
const UTILITY_4DOOR: KccProduct[] = [
  {
    sku: 'U248424', category: 'utility_4door', categoryLabel: 'Utility Cabinet - 4 Doors',
    description: 'Utility Cabinet - 24"W x 84"H x 24"D',
    width: 24, height: 84, depth: 24, doors: 4, drawers: 0, cabinetType: 'tall',
    prices: { SW: 942, LG: 970, SN: 999, MW: 999, EB: 1084, EW: 1084, ES: 0 },
    notes: 'Four doors (upper and lower pairs). Four adjustable shelves. Pantry cabinet.',
  },
  {
    sku: 'U249024', category: 'utility_4door', categoryLabel: 'Utility Cabinet - 4 Doors',
    description: 'Utility Cabinet - 24"W x 90"H x 24"D',
    width: 24, height: 90, depth: 24, doors: 4, drawers: 0, cabinetType: 'tall',
    prices: { SW: 1018, LG: 1048, SN: 1079, MW: 1079, EB: 1170, EW: 1170, ES: 0 },
    notes: 'Four doors (upper and lower pairs). Four adjustable shelves. Pantry cabinet.',
  },
  {
    sku: 'U249624', category: 'utility_4door', categoryLabel: 'Utility Cabinet - 4 Doors',
    description: 'Utility Cabinet - 24"W x 96"H x 24"D',
    width: 24, height: 96, depth: 24, doors: 4, drawers: 0, cabinetType: 'tall',
    prices: { SW: 1085, LG: 1117, SN: 1151, MW: 1151, EB: 1248, EW: 1248, ES: 0 },
    notes: 'Four doors (upper and lower pairs). Four adjustable shelves. Pantry cabinet.',
  },
  {
    sku: 'U308424', category: 'utility_4door', categoryLabel: 'Utility Cabinet - 4 Doors',
    description: 'Utility Cabinet - 30"W x 84"H x 24"D',
    width: 30, height: 84, depth: 24, doors: 4, drawers: 0, cabinetType: 'tall',
    prices: { SW: 1116, LG: 1150, SN: 1183, MW: 1183, EB: 1284, EW: 1284, ES: 0 },
    notes: 'Four doors (upper and lower pairs). Four adjustable shelves. Pantry cabinet.',
  },
  {
    sku: 'U309024', category: 'utility_4door', categoryLabel: 'Utility Cabinet - 4 Doors',
    description: 'Utility Cabinet - 30"W x 90"H x 24"D',
    width: 30, height: 90, depth: 24, doors: 4, drawers: 0, cabinetType: 'tall',
    prices: { SW: 1193, LG: 1228, SN: 1265, MW: 1267, EB: 1372, EW: 1372, ES: 0 },
    notes: 'Four doors (upper and lower pairs). Four adjustable shelves. Pantry cabinet.',
  },
  {
    sku: 'U309624', category: 'utility_4door', categoryLabel: 'Utility Cabinet - 4 Doors',
    description: 'Utility Cabinet - 30"W x 96"H x 24"D',
    width: 30, height: 96, depth: 24, doors: 4, drawers: 0, cabinetType: 'tall',
    prices: { SW: 1252, LG: 1290, SN: 1328, MW: 1328, EB: 1440, EW: 1440, ES: 0 },
    notes: 'Four doors (upper and lower pairs). Four adjustable shelves. Pantry cabinet.',
  },
];

// ---- Oven Cabinets ----
const OVEN_CABINETS: KccProduct[] = [
  {
    sku: 'O338424', category: 'oven_cabinet', categoryLabel: 'Oven Cabinet',
    description: 'Oven Cabinet - 33"W x 84"H x 24"D',
    width: 33, height: 84, depth: 24, doors: 4, drawers: 1, cabinetType: 'tall',
    prices: { SW: 1335, LG: 1375, SN: 1416, MW: 1415, EB: 1535, EW: 1535, ES: 0 },
    notes: 'Oven cutout in middle section. Upper and lower doors with drawer.',
  },
  {
    sku: 'O339024', category: 'oven_cabinet', categoryLabel: 'Oven Cabinet',
    description: 'Oven Cabinet - 33"W x 90"H x 24"D',
    width: 33, height: 90, depth: 24, doors: 4, drawers: 1, cabinetType: 'tall',
    prices: { SW: 1399, LG: 1441, SN: 1483, MW: 1483, EB: 1609, EW: 1609, ES: 0 },
    notes: 'Oven cutout in middle section. Upper and lower doors with drawer.',
  },
  {
    sku: 'O339624', category: 'oven_cabinet', categoryLabel: 'Oven Cabinet',
    description: 'Oven Cabinet - 33"W x 96"H x 24"D',
    width: 33, height: 96, depth: 24, doors: 4, drawers: 1, cabinetType: 'tall',
    prices: { SW: 1525, LG: 1571, SN: 1617, MW: 1617, EB: 1754, EW: 1754, ES: 0 },
    notes: 'Oven cutout in middle section. Upper and lower doors with drawer.',
  },
];

// ============================================
// VANITY CABINETS
// All vanity cabinets: 34 1/2"H x 21"D unless noted
// ============================================

// ---- Vanity Sink Base 21"D - 2 Doors 1 Fake Drawer ----
const VANITY_SINK_1FAKE: KccProduct[] = [
  {
    sku: 'VS24', category: 'vanity_sink_base_1fake', categoryLabel: 'Vanity Sink Base - 2 Doors 1 False Drawer',
    description: 'Vanity Sink Base - 24"W x 34 1/2"H x 21"D',
    width: 24, height: 34.5, depth: 21, doors: 2, drawers: 0, cabinetType: 'vanity',
    prices: { SW: 351, LG: 362, SN: 372, MW: 372, EB: 404, EW: 404, ES: 404 },
    notes: 'Two doors, one false drawer front. Open interior for plumbing.',
  },
  {
    sku: 'VS27', category: 'vanity_sink_base_1fake', categoryLabel: 'Vanity Sink Base - 2 Doors 1 False Drawer',
    description: 'Vanity Sink Base - 27"W x 34 1/2"H x 21"D',
    width: 27, height: 34.5, depth: 21, doors: 2, drawers: 0, cabinetType: 'vanity',
    prices: { SW: 367, LG: 377, SN: 388, MW: 388, EB: 422, EW: 422, ES: 422 },
    notes: 'Two doors, one false drawer front. Open interior for plumbing.',
  },
  {
    sku: 'VS30', category: 'vanity_sink_base_1fake', categoryLabel: 'Vanity Sink Base - 2 Doors 1 False Drawer',
    description: 'Vanity Sink Base - 30"W x 34 1/2"H x 21"D',
    width: 30, height: 34.5, depth: 21, doors: 2, drawers: 0, cabinetType: 'vanity',
    prices: { SW: 399, LG: 411, SN: 423, MW: 423, EB: 458, EW: 458, ES: 458 },
    notes: 'Two doors, one false drawer front. Open interior for plumbing.',
  },
];

// ---- Vanity Sink Base 21"D - 2 Doors 2 Fake Drawers ----
const VANITY_SINK_2FAKE: KccProduct[] = [
  {
    sku: 'VS36', category: 'vanity_sink_base_2fake', categoryLabel: 'Vanity Sink Base - 2 Doors 2 False Drawers',
    description: 'Vanity Sink Base - 36"W x 34 1/2"H x 21"D',
    width: 36, height: 34.5, depth: 21, doors: 2, drawers: 0, cabinetType: 'vanity',
    prices: { SW: 444, LG: 457, SN: 471, MW: 471, EB: 511, EW: 511, ES: 511 },
    notes: 'Two doors, two false drawer fronts. Open interior for plumbing.',
  },
];

// ---- Vanity Drawer Cabinets 21"D - 3 Drawers ----
const VANITY_DRAWER_3DRAWER: KccProduct[] = [
  {
    sku: '3VDB12', category: 'vanity_drawer_3drawer', categoryLabel: 'Vanity Drawer Cabinet - 3 Drawers',
    description: 'Vanity Drawer Cabinet - 12"W x 34 1/2"H x 21"D',
    width: 12, height: 34.5, depth: 21, doors: 0, drawers: 3, cabinetType: 'vanity',
    prices: { SW: 464, LG: 478, SN: 492, MW: 492, EB: 533, EW: 533, ES: 533 },
    notes: 'Three full-width drawers. Soft-close.',
  },
  {
    sku: '3VDB15', category: 'vanity_drawer_3drawer', categoryLabel: 'Vanity Drawer Cabinet - 3 Drawers',
    description: 'Vanity Drawer Cabinet - 15"W x 34 1/2"H x 21"D',
    width: 15, height: 34.5, depth: 21, doors: 0, drawers: 3, cabinetType: 'vanity',
    prices: { SW: 492, LG: 507, SN: 521, MW: 521, EB: 565, EW: 565, ES: 565 },
    notes: 'Three full-width drawers. Soft-close.',
  },
  {
    sku: '3VDB18', category: 'vanity_drawer_3drawer', categoryLabel: 'Vanity Drawer Cabinet - 3 Drawers',
    description: 'Vanity Drawer Cabinet - 18"W x 34 1/2"H x 21"D',
    width: 18, height: 34.5, depth: 21, doors: 0, drawers: 3, cabinetType: 'vanity',
    prices: { SW: 519, LG: 534, SN: 550, MW: 550, EB: 597, EW: 597, ES: 597 },
    notes: 'Three full-width drawers. Soft-close.',
  },
  {
    sku: '3VDB21', category: 'vanity_drawer_3drawer', categoryLabel: 'Vanity Drawer Cabinet - 3 Drawers',
    description: 'Vanity Drawer Cabinet - 21"W x 34 1/2"H x 21"D',
    width: 21, height: 34.5, depth: 21, doors: 0, drawers: 3, cabinetType: 'vanity',
    prices: { SW: 539, LG: 556, SN: 572, MW: 572, EB: 620, EW: 620, ES: 620 },
    notes: 'Three full-width drawers. Soft-close.',
  },
  {
    sku: '3VDB24', category: 'vanity_drawer_3drawer', categoryLabel: 'Vanity Drawer Cabinet - 3 Drawers',
    description: 'Vanity Drawer Cabinet - 24"W x 34 1/2"H x 21"D',
    width: 24, height: 34.5, depth: 21, doors: 0, drawers: 3, cabinetType: 'vanity',
    prices: { SW: 574, LG: 591, SN: 609, MW: 609, EB: 660, EW: 660, ES: 660 },
    notes: 'Three full-width drawers. Soft-close.',
  },
];

// ---- Vanity Combo 21"D - 1 Door 2 Side Drawers 1 Fake ----
const VANITY_COMBO_1DOOR_2SIDE: KccProduct[] = [
  {
    sku: 'V3021DL', category: 'vanity_combo_1door_2side_1fake', categoryLabel: 'Vanity Combo - 1 Door 2 Side Drawers',
    description: 'Vanity Combo - 30"W x 34 1/2"H x 21"D (drawers left)',
    width: 30, height: 34.5, depth: 21, doors: 1, drawers: 2, cabinetType: 'vanity',
    prices: { SW: 643, LG: 663, SN: 682, MW: 682, EB: 739, EW: 739, ES: 739 },
    notes: 'One door, two drawers on left side, one false drawer front.',
  },
  {
    sku: 'V3021DR', category: 'vanity_combo_1door_2side_1fake', categoryLabel: 'Vanity Combo - 1 Door 2 Side Drawers',
    description: 'Vanity Combo - 30"W x 34 1/2"H x 21"D (drawers right)',
    width: 30, height: 34.5, depth: 21, doors: 1, drawers: 2, cabinetType: 'vanity',
    prices: { SW: 643, LG: 663, SN: 682, MW: 682, EB: 739, EW: 739, ES: 739 },
    notes: 'One door, two drawers on right side, one false drawer front.',
  },
];

// ---- Vanity Combo 21"D - 2 Doors 2 Side Drawers 1 Fake ----
const VANITY_COMBO_2DOOR_2SIDE: KccProduct[] = [
  {
    sku: 'V3621DL', category: 'vanity_combo_2door_2side_1fake', categoryLabel: 'Vanity Combo - 2 Doors 2 Side Drawers',
    description: 'Vanity Combo - 36"W x 34 1/2"H x 21"D (drawers left)',
    width: 36, height: 34.5, depth: 21, doors: 2, drawers: 2, cabinetType: 'vanity',
    prices: { SW: 697, LG: 718, SN: 739, MW: 739, EB: 802, EW: 802, ES: 802 },
    notes: 'Two doors, two drawers on left side, one false drawer front.',
  },
  {
    sku: 'V3621DR', category: 'vanity_combo_2door_2side_1fake', categoryLabel: 'Vanity Combo - 2 Doors 2 Side Drawers',
    description: 'Vanity Combo - 36"W x 34 1/2"H x 21"D (drawers right)',
    width: 36, height: 34.5, depth: 21, doors: 2, drawers: 2, cabinetType: 'vanity',
    prices: { SW: 697, LG: 718, SN: 739, MW: 739, EB: 802, EW: 802, ES: 802 },
    notes: 'Two doors, two drawers on right side, one false drawer front.',
  },
];

// ---- Vanity Combo 21"D - 1 Door 4 Side Drawers 1 Fake ----
const VANITY_COMBO_1DOOR_4SIDE: KccProduct[] = [
  {
    sku: 'VSD42-4', category: 'vanity_combo_1door_4side_1fake', categoryLabel: 'Vanity Combo - 1 Door 4 Side Drawers',
    description: 'Vanity Combo - 42"W x 34 1/2"H x 21"D',
    width: 42, height: 34.5, depth: 21, doors: 1, drawers: 4, cabinetType: 'vanity',
    prices: { SW: 829, LG: 854, SN: 856, MW: 856, EB: 953, EW: 953, ES: 2467 },
    notes: 'One door, four side drawers, one false drawer front.',
  },
];

// ---- Vanity Combo 21"D - 2 Doors 4 Side Drawers 1 Fake ----
const VANITY_COMBO_2DOOR_4SIDE: KccProduct[] = [
  {
    sku: 'VSD48-4', category: 'vanity_combo_2door_4side_1fake', categoryLabel: 'Vanity Combo - 2 Doors 4 Side Drawers',
    description: 'Vanity Combo - 48"W x 34 1/2"H x 21"D',
    width: 48, height: 34.5, depth: 21, doors: 2, drawers: 4, cabinetType: 'vanity',
    prices: { SW: 1086, LG: 1118, SN: 1151, MW: 1151, EB: 1249, EW: 1249, ES: 3466 },
    notes: 'Two doors, four side drawers, one false drawer front.',
  },
];

// ---- Vanity Knee Drawer Cabinets ----
const VANITY_KNEE_DRAWER: KccProduct[] = [
  {
    sku: 'VKD30', category: 'vanity_knee_drawer', categoryLabel: 'Vanity Knee Drawer Cabinet',
    description: 'Vanity Knee Drawer - 30"W x 34 1/2"H x 21"D',
    width: 30, height: 34.5, depth: 21, doors: 0, drawers: 1, cabinetType: 'vanity',
    prices: { SW: 157, LG: 161, SN: 167, MW: 167, EB: 181, EW: 181, ES: 181 },
    notes: 'False drawer front for knee space under vanity countertop.',
  },
  {
    sku: 'VKD36', category: 'vanity_knee_drawer', categoryLabel: 'Vanity Knee Drawer Cabinet',
    description: 'Vanity Knee Drawer - 36"W x 34 1/2"H x 21"D',
    width: 36, height: 34.5, depth: 21, doors: 0, drawers: 1, cabinetType: 'vanity',
    prices: { SW: 162, LG: 168, SN: 172, MW: 172, EB: 187, EW: 187, ES: 187 },
    notes: 'False drawer front for knee space under vanity countertop.',
  },
];

// ============================================
// PANELS
// ============================================

// ---- Refrigerator Panels ----
const REFRIGERATOR_PANELS: KccProduct[] = [
  {
    sku: 'REPV2496', category: 'refrigerator_panel', categoryLabel: 'Refrigerator Panel',
    description: 'Refrigerator Panel - 24"W x 96"H x 1/4"D',
    width: 24, height: 96, depth: 0.25, doors: 0, drawers: 0, cabinetType: 'panel',
    prices: { SW: 189, LG: 195, SN: 201, MW: 201, EB: 218, EW: 211, ES: 218 },
    notes: 'Finished panel for side of refrigerator enclosure.',
  },
  {
    sku: 'REPV2796', category: 'refrigerator_panel', categoryLabel: 'Refrigerator Panel',
    description: 'Refrigerator Panel - 27"W x 96"H x 1/4"D',
    width: 27, height: 96, depth: 0.25, doors: 0, drawers: 0, cabinetType: 'panel',
    prices: { SW: 303, LG: 312, SN: 321, MW: 321, EB: 348, EW: 348, ES: 348 },
    notes: 'Finished panel for side of refrigerator enclosure.',
  },
  {
    sku: 'REPV30120', category: 'refrigerator_panel', categoryLabel: 'Refrigerator Panel',
    description: 'Refrigerator Panel - 27"W x 108"H x 1/4"D',
    width: 27, height: 108, depth: 0.25, doors: 0, drawers: 0, cabinetType: 'panel',
    prices: { SW: 431, LG: 444, SN: 457, MW: 523, EB: 496, EW: 496, ES: 496 },
    notes: 'Finished panel for side of refrigerator enclosure. Extra tall.',
  },
  {
    sku: 'S2496', category: 'refrigerator_panel', categoryLabel: 'Shelf Board',
    description: 'Shelf Board - 24"W x 96"H',
    width: 24, height: 96, depth: 0.75, doors: 0, drawers: 0, cabinetType: 'panel',
    prices: { SW: 183, LG: 188, SN: 195, MW: 195, EB: 210, EW: 204, ES: 210 },
    notes: 'Shelf board for refrigerator enclosure or custom shelving.',
  },
];

// ---- Dishwasher Panel ----
const DISHWASHER_PANEL: KccProduct[] = [
  {
    sku: 'DWR3', category: 'dishwasher_panel', categoryLabel: 'Dishwasher Panel',
    description: 'Dishwasher Return Panel - 24"W x 34 1/2"H',
    width: 24, height: 34.5, depth: 0.25, doors: 0, drawers: 0, cabinetType: 'panel',
    prices: { SW: 108, LG: 112, SN: 115, MW: 115, EB: 125, EW: 121, ES: 125 },
    notes: 'Finished panel for side of dishwasher.',
  },
];

// ---- Wall Skin Panel ----
const WALL_SKIN_PANEL: KccProduct[] = [
  {
    sku: 'WSV42', category: 'wall_skin_panel', categoryLabel: 'Wall Skin Panel',
    description: 'Wall Skin Panel - 15"W x 42"H x 1/4"D',
    width: 15, height: 42, depth: 0.25, doors: 0, drawers: 0, cabinetType: 'panel',
    prices: { SW: 25, LG: 26, SN: 27, MW: 27, EB: 29, EW: 31, ES: 29 },
    notes: 'Finished skin panel for exposed wall cabinet side.',
  },
];

// ---- Base Skin Panel ----
const BASE_SKIN_PANEL: KccProduct[] = [
  {
    sku: 'BSV', category: 'base_skin_panel', categoryLabel: 'Base Skin Panel',
    description: 'Base Skin Panel - 23.25"W x 34 1/2"H x 1/4"D',
    width: 23.25, height: 34.5, depth: 0.25, doors: 0, drawers: 0, cabinetType: 'panel',
    prices: { SW: 40, LG: 42, SN: 44, MW: 44, EB: 47, EW: 47, ES: 47 },
    notes: 'Finished skin panel for exposed base cabinet side.',
  },
];

// ---- Tall Skin Panels ----
const TALL_SKIN_PANELS: KccProduct[] = [
  {
    sku: 'FPV4296', category: 'tall_skin_panel', categoryLabel: 'Tall Skin Panel',
    description: 'Finished Panel - 42"W x 96"H x 1/4"D',
    width: 42, height: 96, depth: 0.25, doors: 0, drawers: 0, cabinetType: 'panel',
    prices: { SW: 162, LG: 168, SN: 184, MW: 184, EB: 187, EW: 152, ES: 187 },
    notes: 'Full-height finished panel for cabinet ends or custom applications.',
  },
  {
    sku: 'BBFPV4296', category: 'tall_skin_panel', categoryLabel: 'Tall Skin Panel - Bead Board',
    description: 'Bead Board Finished Panel - 42"W x 96"H x 1/4"D',
    width: 42, height: 96, depth: 0.25, doors: 0, drawers: 0, cabinetType: 'panel',
    prices: { SW: 292, LG: 307, SN: 310, MW: 310, EB: 336, EW: 336, ES: 336 },
    notes: 'Bead board style finished panel for decorative application.',
  },
  {
    sku: 'USV2496', category: 'tall_skin_panel', categoryLabel: 'Tall Skin Panel',
    description: 'Utility Skin Panel - 23.25"W x 96"H x 1/4"D',
    width: 23.25, height: 96, depth: 0.25, doors: 0, drawers: 0, cabinetType: 'panel',
    prices: { SW: 84, LG: 86, SN: 89, MW: 89, EB: 97, EW: 97, ES: 97 },
    notes: 'Finished skin panel for exposed tall/utility cabinet side.',
  },
];

// ============================================
// DECORATIVE DOORS
// ============================================

// ---- Base Decorative Door ----
const BASE_DECORATIVE_DOOR: KccProduct[] = [
  {
    sku: 'BDEP', category: 'base_decorative_door', categoryLabel: 'Base Decorative Door Panel',
    description: 'Base Decorative End Panel - 23.5"W x 34 1/2"H',
    width: 23.5, height: 34.5, depth: 0.75, doors: 0, drawers: 0, cabinetType: 'panel',
    prices: { SW: 194, LG: 199, SN: 206, MW: 206, EB: 223, EW: 215, ES: 223 },
    notes: 'Decorative door-style end panel for base cabinet.',
  },
];

// ---- Wall Decorative Doors ----
const WALL_DECORATIVE_DOORS: KccProduct[] = [
  {
    sku: 'WDEP12', category: 'wall_decorative_door', categoryLabel: 'Wall Decorative Door Panel',
    description: 'Wall Decorative End Panel - 11.5"W x 11"H',
    width: 11.5, height: 11, depth: 0.75, doors: 0, drawers: 0, cabinetType: 'panel',
    prices: { SW: 74, LG: 76, SN: 79, MW: 79, EB: 85, EW: 83, ES: 85 },
    notes: 'Decorative door-style end panel for wall cabinet.',
  },
  {
    sku: 'WDEP18', category: 'wall_decorative_door', categoryLabel: 'Wall Decorative Door Panel',
    description: 'Wall Decorative End Panel - 17.5"W x 11"H',
    width: 17.5, height: 11, depth: 0.75, doors: 0, drawers: 0, cabinetType: 'panel',
    prices: { SW: 83, LG: 85, SN: 88, MW: 88, EB: 94, EW: 94, ES: 94 },
    notes: 'Decorative door-style end panel for wall cabinet.',
  },
  {
    sku: 'WDEP30', category: 'wall_decorative_door', categoryLabel: 'Wall Decorative Door Panel',
    description: 'Wall Decorative End Panel - 11.5"W x 29"H',
    width: 11.5, height: 29, depth: 0.75, doors: 0, drawers: 0, cabinetType: 'panel',
    prices: { SW: 87, LG: 89, SN: 92, MW: 92, EB: 100, EW: 96, ES: 100 },
    notes: 'Decorative door-style end panel for wall cabinet.',
  },
  {
    sku: 'WDEP36', category: 'wall_decorative_door', categoryLabel: 'Wall Decorative Door Panel',
    description: 'Wall Decorative End Panel - 11.5"W x 35"H',
    width: 11.5, height: 35, depth: 0.75, doors: 0, drawers: 0, cabinetType: 'panel',
    prices: { SW: 99, LG: 102, SN: 105, MW: 105, EB: 114, EW: 111, ES: 114 },
    notes: 'Decorative door-style end panel for wall cabinet.',
  },
  {
    sku: 'WDEP42', category: 'wall_decorative_door', categoryLabel: 'Wall Decorative Door Panel',
    description: 'Wall Decorative End Panel - 11.5"W x 41"H',
    width: 11.5, height: 41, depth: 0.75, doors: 0, drawers: 0, cabinetType: 'panel',
    prices: { SW: 112, LG: 115, SN: 119, MW: 119, EB: 128, EW: 126, ES: 128 },
    notes: 'Decorative door-style end panel for wall cabinet.',
  },
];

// ---- Tall Decorative Doors ----
const TALL_DECORATIVE_DOORS: KccProduct[] = [
  {
    sku: 'TDEP2484', category: 'tall_decorative_door', categoryLabel: 'Tall Decorative Door Panel',
    description: 'Tall Decorative End Panel - 23.5"W x 78.5"H',
    width: 23.5, height: 78.5, depth: 0.75, doors: 0, drawers: 0, cabinetType: 'panel',
    prices: { SW: 458, LG: 472, SN: 486, MW: 486, EB: 528, EW: 528, ES: 528 },
    notes: 'Decorative door-style end panel for tall cabinet.',
  },
  {
    sku: 'TDEP2490', category: 'tall_decorative_door', categoryLabel: 'Tall Decorative Door Panel',
    description: 'Tall Decorative End Panel - 23.5"W x 84.5"H',
    width: 23.5, height: 84.5, depth: 0.75, doors: 0, drawers: 0, cabinetType: 'panel',
    prices: { SW: 484, LG: 498, SN: 513, MW: 513, EB: 557, EW: 557, ES: 557 },
    notes: 'Decorative door-style end panel for tall cabinet.',
  },
  {
    sku: 'TDEP2496', category: 'tall_decorative_door', categoryLabel: 'Tall Decorative Door Panel',
    description: 'Tall Decorative End Panel - 23.5"W x 90.5"H',
    width: 23.5, height: 90.5, depth: 0.75, doors: 0, drawers: 0, cabinetType: 'panel',
    prices: { SW: 534, LG: 550, SN: 566, MW: 566, EB: 614, EW: 616, ES: 614 },
    notes: 'Decorative door-style end panel for tall cabinet.',
  },
];

// ============================================
// MOLDINGS
// All moldings: 96" (8') lengths unless noted
// ============================================

// ---- Crown Moldings ----
const CROWN_MOLDINGS: KccProduct[] = [
  {
    sku: 'BCM8', category: 'crown_molding', categoryLabel: 'Crown Molding - Beveled',
    description: 'Beveled Crown Molding - 96" length',
    width: 96, height: 3, depth: 0, doors: 0, drawers: 0, cabinetType: 'molding',
    prices: { SW: 150, LG: 154, SN: 159, MW: 159, EB: 172, EW: 168, ES: 172 },
    notes: 'Beveled crown molding. 8-foot length. Cut to fit on site.',
  },
  {
    sku: 'CCM8', category: 'crown_molding', categoryLabel: 'Crown Molding - Classic',
    description: 'Classic Crown Molding - 96" length',
    width: 96, height: 3, depth: 0, doors: 0, drawers: 0, cabinetType: 'molding',
    prices: { SW: 192, LG: 197, SN: 204, MW: 204, EB: 221, EW: 179, ES: 221 },
    notes: 'Classic crown molding. 8-foot length. Cut to fit on site.',
  },
  {
    sku: 'ACM8', category: 'crown_molding', categoryLabel: 'Crown Molding - Angle',
    description: 'Angle Crown Molding - 96" length',
    width: 96, height: 3, depth: 0, doors: 0, drawers: 0, cabinetType: 'molding',
    prices: { SW: 115, LG: 118, SN: 123, MW: 123, EB: 132, EW: 132, ES: 132 },
    notes: 'Angle crown molding. 8-foot length. Cut to fit on site.',
  },
  {
    sku: 'CM8', category: 'crown_molding', categoryLabel: 'Crown Molding - Standard',
    description: 'Standard Crown Molding - 96" length',
    width: 96, height: 3, depth: 0, doors: 0, drawers: 0, cabinetType: 'molding',
    prices: { SW: 126, LG: 129, SN: 133, MW: 133, EB: 144, EW: 139, ES: 144 },
    notes: 'Standard crown molding. 8-foot length. Cut to fit on site.',
  },
];

// ---- Undercabinet Moldings (Light Rail) ----
const UNDERCAB_MOLDINGS: KccProduct[] = [
  {
    sku: 'LRM8', category: 'undercab_molding', categoryLabel: 'Light Rail Molding',
    description: 'Light Rail Molding - 96" length',
    width: 96, height: 1.5, depth: 0, doors: 0, drawers: 0, cabinetType: 'molding',
    prices: { SW: 133, LG: 138, SN: 142, MW: 142, EB: 153, EW: 150, ES: 153 },
    notes: 'Undercabinet light rail molding. 8-foot length.',
  },
  {
    sku: 'ALRM8', category: 'undercab_molding', categoryLabel: 'Angled Light Rail Molding',
    description: 'Angled Light Rail Molding - 96" length',
    width: 96, height: 1.5, depth: 0, doors: 0, drawers: 0, cabinetType: 'molding',
    prices: { SW: 125, LG: 128, SN: 139, MW: 139, EB: 143, EW: 143, ES: 143 },
    notes: 'Angled undercabinet light rail molding. 8-foot length.',
  },
];

// ---- Base Moldings ----
const BASE_MOLDINGS: KccProduct[] = [
  {
    sku: 'FBM', category: 'base_molding', categoryLabel: 'Furniture Base Molding',
    description: 'Furniture Base Molding - 96" length',
    width: 96, height: 4, depth: 0, doors: 0, drawers: 0, cabinetType: 'molding',
    prices: { SW: 146, LG: 151, SN: 156, MW: 156, EB: 168, EW: 159, ES: 168 },
    notes: 'Decorative furniture base molding. 8-foot length.',
  },
  {
    sku: 'SHM', category: 'base_molding', categoryLabel: 'Shoe Molding',
    description: 'Shoe Molding - 96" length',
    width: 96, height: 0.75, depth: 0, doors: 0, drawers: 0, cabinetType: 'molding',
    prices: { SW: 25, LG: 26, SN: 27, MW: 27, EB: 29, EW: 31, ES: 29 },
    notes: 'Shoe molding for base cabinet trim. 8-foot length.',
  },
  {
    sku: 'TKC', category: 'base_molding', categoryLabel: 'Toe Kick Cover',
    description: 'Toe Kick Cover - 96" (8\' plywood)',
    width: 96, height: 4, depth: 0, doors: 0, drawers: 0, cabinetType: 'molding',
    prices: { SW: 32, LG: 33, SN: 34, MW: 34, EB: 36, EW: 36, ES: 36 },
    notes: 'Plywood toe kick cover strip. 8-foot length.',
  },
];

// ---- Other Moldings ----
const OTHER_MOLDINGS: KccProduct[] = [
  {
    sku: 'OCM8', category: 'molding', categoryLabel: 'Outside Corner Molding',
    description: 'Outside Corner Molding - 96" length',
    width: 96, height: 0, depth: 0, doors: 0, drawers: 0, cabinetType: 'molding',
    prices: { SW: 31, LG: 32, SN: 33, MW: 33, EB: 35, EW: 33, ES: 35 },
    notes: 'Outside corner trim molding. 8-foot length.',
  },
  {
    sku: 'SMB', category: 'molding', categoryLabel: 'Scribe Molding',
    description: 'Scribe Molding - 96" length',
    width: 96, height: 0, depth: 0, doors: 0, drawers: 0, cabinetType: 'molding',
    prices: { SW: 33, LG: 34, SN: 35, MW: 35, EB: 38, EW: 33, ES: 38 },
    notes: 'Scribe molding for filling gaps between cabinet and wall. 8-foot length.',
  },
  {
    sku: 'BAM', category: 'molding', categoryLabel: 'Batten Molding',
    description: 'Batten Molding - 96" length',
    width: 96, height: 0, depth: 0, doors: 0, drawers: 0, cabinetType: 'molding',
    prices: { SW: 33, LG: 34, SN: 35, MW: 35, EB: 38, EW: 35, ES: 38 },
    notes: 'Batten molding trim strip. 8-foot length.',
  },
];

// ============================================
// FILLERS
// ============================================

const FILLERS: KccProduct[] = [
  {
    sku: 'F342', category: 'filler', categoryLabel: 'Filler',
    description: 'Filler - 3"W x 42"H',
    width: 3, height: 42, depth: 0.75, doors: 0, drawers: 0, cabinetType: 'filler',
    prices: { SW: 32, LG: 33, SN: 34, MW: 34, EB: 36, EW: 35, ES: 36 },
    notes: 'Wall filler strip. Rip to size on site.',
  },
  {
    sku: 'F642', category: 'filler', categoryLabel: 'Filler',
    description: 'Filler - 6"W x 42"H',
    width: 6, height: 42, depth: 0.75, doors: 0, drawers: 0, cabinetType: 'filler',
    prices: { SW: 61, LG: 63, SN: 65, MW: 65, EB: 70, EW: 70, ES: 70 },
    notes: 'Wall filler strip. Rip to size on site.',
  },
  {
    sku: 'F396', category: 'filler', categoryLabel: 'Filler',
    description: 'Filler - 3"W x 96"H',
    width: 3, height: 96, depth: 0.75, doors: 0, drawers: 0, cabinetType: 'filler',
    prices: { SW: 105, LG: 108, SN: 112, MW: 112, EB: 121, EW: 117, ES: 121 },
    notes: 'Full-height filler strip. Rip to size on site.',
  },
  {
    sku: 'F696', category: 'filler', categoryLabel: 'Filler',
    description: 'Filler - 6"W x 96"H',
    width: 6, height: 96, depth: 0.75, doors: 0, drawers: 0, cabinetType: 'filler',
    prices: { SW: 157, LG: 161, SN: 167, MW: 167, EB: 181, EW: 174, ES: 181 },
    notes: 'Full-height filler strip. Rip to size on site.',
  },
  {
    sku: 'F3120', category: 'filler', categoryLabel: 'Filler',
    description: 'Filler - 3"W x 108"H',
    width: 3, height: 108, depth: 0.75, doors: 0, drawers: 0, cabinetType: 'filler',
    prices: { SW: 108, LG: 0, SN: 0, MW: 126, EB: 0, EW: 117, ES: 0 },
    notes: 'Extra tall filler strip. Limited color availability.',
  },
  {
    sku: 'F6120', category: 'filler', categoryLabel: 'Filler',
    description: 'Filler - 6"W x 108"H',
    width: 6, height: 108, depth: 0.75, doors: 0, drawers: 0, cabinetType: 'filler',
    prices: { SW: 262, LG: 269, SN: 280, MW: 280, EB: 288, EW: 288, ES: 288 },
    notes: 'Extra tall filler strip.',
  },
];

// ============================================
// SPECIALTY & ACCESSORIES
// ============================================

// ---- Corbels ----
const CORBELS: KccProduct[] = [
  {
    sku: 'MCB', category: 'corbel', categoryLabel: 'Corbel - Mission Style',
    description: 'Mission Corbel - 3"W x 12"H',
    width: 3, height: 12, depth: 0, doors: 0, drawers: 0, cabinetType: 'specialty',
    prices: { SW: 205, LG: 211, SN: 216, MW: 216, EB: 235, EW: 235, ES: 235 },
    notes: 'Decorative mission-style corbel. Pair required for island or range hood.',
  },
  {
    sku: 'CBT', category: 'corbel', categoryLabel: 'Corbel - Traditional',
    description: 'Traditional Corbel - 2"W x 9"H',
    width: 2, height: 9, depth: 0, doors: 0, drawers: 0, cabinetType: 'specialty',
    prices: { SW: 254, LG: 0, SN: 264, MW: 0, EB: 0, EW: 164, ES: 0 },
    notes: 'Decorative traditional corbel. Limited color availability.',
  },
];

// ---- Decorative Post ----
const DECORATIVE_POSTS: KccProduct[] = [
  {
    sku: 'SQDL', category: 'decorative_post', categoryLabel: 'Decorative Post',
    description: 'Square Decorative Leg - 3"W x 34 1/2"H',
    width: 3, height: 34.5, depth: 3, doors: 0, drawers: 0, cabinetType: 'specialty',
    prices: { SW: 280, LG: 289, SN: 297, MW: 297, EB: 322, EW: 322, ES: 322 },
    notes: 'Square decorative post/leg for island or peninsula end.',
  },
];

// ---- Valances ----
const VALANCES: KccProduct[] = [
  {
    sku: 'VA36', category: 'valance', categoryLabel: 'Valance',
    description: 'Valance - 36"W',
    width: 36, height: 5, depth: 0, doors: 0, drawers: 0, cabinetType: 'specialty',
    prices: { SW: 105, LG: 108, SN: 112, MW: 112, EB: 121, EW: 121, ES: 121 },
    notes: 'Decorative valance for above sink or window.',
  },
  {
    sku: 'VA48', category: 'valance', categoryLabel: 'Valance',
    description: 'Valance - 48"W',
    width: 48, height: 5, depth: 0, doors: 0, drawers: 0, cabinetType: 'specialty',
    prices: { SW: 127, LG: 131, SN: 135, MW: 135, EB: 146, EW: 142, ES: 146 },
    notes: 'Decorative valance for above sink or window.',
  },
];

// ---- Roll-Out Trays (universal price, no color variant) ----
const ROLL_OUT_TRAYS: KccProduct[] = [
  {
    sku: 'RS15', category: 'roll_out_tray', categoryLabel: 'Roll-Out Tray',
    description: 'Roll-Out Tray - fits B15',
    width: 15, height: 3, depth: 21, doors: 0, drawers: 0, cabinetType: 'accessory',
    prices: { SW: 146, LG: 146, SN: 146, MW: 146, EB: 146, EW: 146, ES: 146 },
    notes: 'Full-extension roll-out tray. Fits B15 base cabinet.',
  },
  {
    sku: 'RS18', category: 'roll_out_tray', categoryLabel: 'Roll-Out Tray',
    description: 'Roll-Out Tray - fits B18 & U18XX24',
    width: 18, height: 3, depth: 21, doors: 0, drawers: 0, cabinetType: 'accessory',
    prices: { SW: 146, LG: 146, SN: 146, MW: 146, EB: 146, EW: 146, ES: 146 },
    notes: 'Full-extension roll-out tray. Fits B18 and 18" utility cabinets.',
  },
  {
    sku: 'RS21', category: 'roll_out_tray', categoryLabel: 'Roll-Out Tray',
    description: 'Roll-Out Tray - fits B21',
    width: 21, height: 3, depth: 21, doors: 0, drawers: 0, cabinetType: 'accessory',
    prices: { SW: 154, LG: 154, SN: 154, MW: 154, EB: 154, EW: 154, ES: 154 },
    notes: 'Full-extension roll-out tray. Fits B21 base cabinet.',
  },
  {
    sku: 'RS24', category: 'roll_out_tray', categoryLabel: 'Roll-Out Tray',
    description: 'Roll-Out Tray - fits B24 & U24XX24',
    width: 24, height: 3, depth: 21, doors: 0, drawers: 0, cabinetType: 'accessory',
    prices: { SW: 161, LG: 161, SN: 161, MW: 161, EB: 161, EW: 161, ES: 161 },
    notes: 'Full-extension roll-out tray. Fits B24 and 24" utility cabinets.',
  },
  {
    sku: 'RS27', category: 'roll_out_tray', categoryLabel: 'Roll-Out Tray',
    description: 'Roll-Out Tray - fits B27',
    width: 27, height: 3, depth: 21, doors: 0, drawers: 0, cabinetType: 'accessory',
    prices: { SW: 167, LG: 167, SN: 167, MW: 167, EB: 167, EW: 167, ES: 167 },
    notes: 'Full-extension roll-out tray. Fits B27 base cabinet.',
  },
  {
    sku: 'RS30', category: 'roll_out_tray', categoryLabel: 'Roll-Out Tray',
    description: 'Roll-Out Tray - fits B30 & U30XX24',
    width: 30, height: 3, depth: 21, doors: 0, drawers: 0, cabinetType: 'accessory',
    prices: { SW: 175, LG: 175, SN: 175, MW: 175, EB: 175, EW: 175, ES: 175 },
    notes: 'Full-extension roll-out tray. Fits B30 and 30" utility cabinets.',
  },
  {
    sku: 'RS33', category: 'roll_out_tray', categoryLabel: 'Roll-Out Tray',
    description: 'Roll-Out Tray - fits B33',
    width: 33, height: 3, depth: 21, doors: 0, drawers: 0, cabinetType: 'accessory',
    prices: { SW: 180, LG: 180, SN: 180, MW: 180, EB: 180, EW: 180, ES: 180 },
    notes: 'Full-extension roll-out tray. Fits B33 base cabinet.',
  },
  {
    sku: 'RS36', category: 'roll_out_tray', categoryLabel: 'Roll-Out Tray',
    description: 'Roll-Out Tray - fits B36',
    width: 36, height: 3, depth: 21, doors: 0, drawers: 0, cabinetType: 'accessory',
    prices: { SW: 188, LG: 188, SN: 188, MW: 188, EB: 188, EW: 188, ES: 188 },
    notes: 'Full-extension roll-out tray. Fits B36 base cabinet.',
  },
];

// ---- Touch Up ----
const TOUCH_UP: KccProduct[] = [
  {
    sku: 'TUK', category: 'touch_up', categoryLabel: 'Touch Up Kit',
    description: 'Touch Up Kit',
    width: 0, height: 0, depth: 0, doors: 0, drawers: 0, cabinetType: 'accessory',
    prices: { SW: 18, LG: 25, SN: 18, MW: 30, EB: 30, EW: 18, ES: 30 },
    notes: 'Touch up kit with marker and filler. Color-matched.',
  },
  {
    sku: 'SPAINT', category: 'touch_up', categoryLabel: 'Spray Paint',
    description: 'Spray Paint - Color Matched',
    width: 0, height: 0, depth: 0, doors: 0, drawers: 0, cabinetType: 'accessory',
    prices: { SW: 27, LG: 32, SN: 32, MW: 27, EB: 32, EW: 32, ES: 32 },
    notes: 'Color-matched spray paint for touch ups.',
  },
];

// ============================================
// COMBINED CATALOG EXPORT
// ============================================

export const KCC_CATALOG: KccProduct[] = [
  // Base Cabinets
  ...BASE_1DOOR,
  ...BASE_1DOOR_1DRAWER,
  ...BASE_2DOOR_1DRAWER,
  ...BASE_2DOOR_2DRAWER,
  ...DRAWER_BASE_2DRAWER,
  ...DRAWER_BASE_3DRAWER,
  ...SPICE_RACK_BASE,
  ...WASTE_BIN_BASE,
  ...TRASH_BINS,
  ...ANGLED_BASE_END,
  ...MICROWAVE_BASE,
  ...EASY_REACH_BASE,
  ...BLIND_BASE_CORNER,
  ...CORNER_SINK_BASE,
  ...SINK_BASE_1FAKE,
  ...SINK_BASE_2FAKE,
  ...FARM_SINK_BASE,

  // Wall Cabinets
  ...WALL_30H_1DOOR,
  ...WALL_30H_2DOOR,
  ...WALL_36H_1DOOR,
  ...WALL_36H_2DOOR,
  ...WALL_42H_1DOOR,
  ...WALL_42H_2DOOR,
  ...DIAGONAL_CORNER_WALL_12D,
  ...DIAGONAL_CORNER_WALL_15D,
  ...WALL_EASY_REACH,
  ...WALL_BLIND_CORNER_30H,
  ...WALL_BLIND_CORNER_36H,
  ...WALL_BLIND_CORNER_42H,
  ...WALL_12H_2DOOR,
  ...WALL_15H_2DOOR,
  ...WALL_18H_1DOOR,
  ...WALL_18H_2DOOR,
  ...WALL_24H_2DOOR,
  ...WALL_REFRIG_12H_24D,
  ...WALL_REFRIG_15H_24D,
  ...WALL_REFRIG_18H_24D,
  ...WALL_REFRIG_24H_24D,
  ...WALL_GLASS_30H_1ROUTED,
  ...WALL_GLASS_30H_2ROUTED,
  ...WALL_GLASS_36H_1ROUTED,
  ...WALL_GLASS_36H_2ROUTED,
  ...WALL_GLASS_42H_1ROUTED,
  ...WALL_GLASS_42H_2ROUTED,
  ...DIAGONAL_CORNER_WALL_GLASS_12D,
  ...DIAGONAL_CORNER_WALL_GLASS_15D,
  ...WALL_GLASS_12H_1ROUTED,
  ...WALL_GLASS_12H_2ROUTED,
  ...ANGLED_WALL,
  ...WALL_OPEN_SHELF,
  ...WALL_MICROWAVE,
  ...WALL_DRAWER,
  ...WINE_RACKS,
  ...GLASS_STEAM_HOLDERS,

  // Tall Cabinets
  ...UTILITY_2DOOR,
  ...UTILITY_4DOOR,
  ...OVEN_CABINETS,

  // Vanity Cabinets
  ...VANITY_SINK_1FAKE,
  ...VANITY_SINK_2FAKE,
  ...VANITY_DRAWER_3DRAWER,
  ...VANITY_COMBO_1DOOR_2SIDE,
  ...VANITY_COMBO_2DOOR_2SIDE,
  ...VANITY_COMBO_1DOOR_4SIDE,
  ...VANITY_COMBO_2DOOR_4SIDE,
  ...VANITY_KNEE_DRAWER,

  // Panels
  ...REFRIGERATOR_PANELS,
  ...DISHWASHER_PANEL,
  ...WALL_SKIN_PANEL,
  ...BASE_SKIN_PANEL,
  ...TALL_SKIN_PANELS,

  // Decorative Doors
  ...BASE_DECORATIVE_DOOR,
  ...WALL_DECORATIVE_DOORS,
  ...TALL_DECORATIVE_DOORS,

  // Moldings
  ...CROWN_MOLDINGS,
  ...UNDERCAB_MOLDINGS,
  ...BASE_MOLDINGS,
  ...OTHER_MOLDINGS,

  // Fillers
  ...FILLERS,

  // Specialty & Accessories
  ...CORBELS,
  ...DECORATIVE_POSTS,
  ...VALANCES,
  ...ROLL_OUT_TRAYS,
  ...TOUCH_UP,
];

// ---- Lookup Helpers ----

/** Find a product by SKU */
export function findProductBySku(sku: string): KccProduct | undefined {
  return KCC_CATALOG.find((p) => p.sku === sku);
}

/** Get all products in a category */
export function getProductsByCategory(category: string): KccProduct[] {
  return KCC_CATALOG.filter((p) => p.category === category);
}

/** Get all products by cabinet type */
export function getProductsByType(cabinetType: KccProduct['cabinetType']): KccProduct[] {
  return KCC_CATALOG.filter((p) => p.cabinetType === cabinetType);
}

/** Total number of products in catalog */
export const KCC_CATALOG_COUNT = KCC_CATALOG.length;
