/**
 * Dynamic PDF Content Generator
 * Generates payment milestones and project notes based on actual project scope
 */

import { Estimate } from '@/types/database';

export interface PaymentMilestone {
  percent: number;
  label: string;
  description: string;
}

interface ScopeAnalysis {
  hasDemo: boolean;
  hasCabinets: boolean;
  hasTile: boolean;
  hasGranite: boolean;
  hasPlumbing: boolean;
  hasFlooring: boolean;
  hasGlass: boolean;
  hasPaint: boolean;
  hasElectrical: boolean;
  isKitchen: boolean;
  isBathroom: boolean;
  isTileOnly: boolean;
}

/**
 * Analyze the estimate to determine what scope items are present
 */
function analyzeScope(estimate: Estimate): ScopeAnalysis {
  const payload = estimate.internal_json_payload as Record<string, unknown> | null;
  const lineItems = (payload?.pricing as Record<string, unknown>)?.line_items as Array<{
    category?: string;
    task_description?: string;
  }> | undefined;

  const hasDemo = lineItems?.some(item => {
    const cat = (item.category || '').toLowerCase();
    const desc = (item.task_description || '').toLowerCase();
    return cat.includes('demo') || desc.includes('demo') || desc.includes('remove') || desc.includes('dumpster');
  }) ?? (estimate.include_demo !== false && (estimate.demo_cp_total || 0) > 0);

  const hasCabinets = lineItems?.some(item => {
    const cat = (item.category || '').toLowerCase();
    const desc = (item.task_description || '').toLowerCase();
    return cat.includes('cabinet') || desc.includes('cabinet') || desc.includes('vanity');
  }) ?? ((estimate.cabinets_cp_total || 0) > 0 || (estimate.vanities_cp_total || 0) > 0);

  const hasTile = lineItems?.some(item => {
    const cat = (item.category || '').toLowerCase();
    const desc = (item.task_description || '').toLowerCase();
    return cat.includes('tile') || desc.includes('tile') || desc.includes('grout');
  }) ?? ((estimate.tile_cp_total || 0) > 0);

  const hasGranite = lineItems?.some(item => {
    const desc = (item.task_description || '').toLowerCase();
    return desc.includes('granite') || desc.includes('quartz') || desc.includes('countertop');
  }) ?? ((estimate.quartz_cp_total || 0) > 0);

  const hasPlumbing = lineItems?.some(item => {
    const cat = (item.category || '').toLowerCase();
    const desc = (item.task_description || '').toLowerCase();
    return cat.includes('plumb') || desc.includes('plumb') || desc.includes('valve') || 
           desc.includes('toilet') || desc.includes('faucet') || desc.includes('drain');
  }) ?? (estimate.include_plumbing !== false && (estimate.plumbing_cp_total || 0) > 0);

  const hasFlooring = lineItems?.some(item => {
    const desc = (item.task_description || '').toLowerCase();
    return desc.includes('lvp') || desc.includes('vinyl') || desc.includes('flooring') || 
           desc.includes('hardwood') || desc.includes('laminate');
  }) ?? false;

  const hasGlass = lineItems?.some(item => {
    const cat = (item.category || '').toLowerCase();
    const desc = (item.task_description || '').toLowerCase();
    return cat.includes('glass') || desc.includes('frameless') || desc.includes('glass panel') || 
           desc.includes('shower door') || desc.includes('enclosure');
  }) ?? (estimate.include_glass !== false && (estimate.glass_cp_total || 0) > 0);

  const hasPaint = lineItems?.some(item => {
    const cat = (item.category || '').toLowerCase();
    const desc = (item.task_description || '').toLowerCase();
    return cat.includes('paint') || desc.includes('paint') || desc.includes('primer');
  }) ?? (estimate.include_paint !== false && (estimate.paint_cp_total || 0) > 0);

  const hasElectrical = lineItems?.some(item => {
    const cat = (item.category || '').toLowerCase();
    const desc = (item.task_description || '').toLowerCase();
    return cat.includes('electric') || desc.includes('outlet') || desc.includes('switch') || 
           desc.includes('recessed') || desc.includes('light');
  }) ?? (estimate.include_electrical !== false && (estimate.lighting_cp_total || 0) > 0);

  const isKitchen = estimate.has_kitchen === true;
  const isBathroom = estimate.has_bathrooms === true;
  const isTileOnly = hasTile && !hasCabinets && !hasPlumbing && !hasGlass;

  return {
    hasDemo,
    hasCabinets,
    hasTile,
    hasGranite,
    hasPlumbing,
    hasFlooring,
    hasGlass,
    hasPaint,
    hasElectrical,
    isKitchen,
    isBathroom,
    isTileOnly,
  };
}

/**
 * Generate dynamic payment milestones based on project type and scope
 */
export function generatePaymentMilestones(
  estimate: Estimate,
  depositPct: number = 65,
  progressPct: number = 25,
  finalPct: number = 10
): PaymentMilestone[] {
  const scope = analyzeScope(estimate);

  // Kitchen with cabinets
  if (scope.isKitchen && scope.hasCabinets) {
    return [
      {
        percent: depositPct,
        label: 'Upon Contract Signing',
        description: 'Includes mobilization, materials ordering, and scheduling',
      },
      {
        percent: progressPct,
        label: 'Upon Cabinet Installation',
        description: 'Cabinets installed, countertops templated, rough work complete',
      },
      {
        percent: finalPct,
        label: 'At Project Completion',
        description: 'All appliances installed, final walkthrough complete',
      },
    ];
  }

  // Bathroom with tile
  if (scope.isBathroom && scope.hasTile) {
    return [
      {
        percent: depositPct,
        label: 'Upon Contract Signing',
        description: 'Includes demolition, plumbing rough-in, and materials ordering',
      },
      {
        percent: progressPct,
        label: 'At Tile Installation',
        description: 'Waterproofing and substrate prep complete',
      },
      {
        percent: finalPct,
        label: 'At Project Completion',
        description: 'All fixtures installed, final walkthrough complete',
      },
    ];
  }

  // Tile-only job
  if (scope.isTileOnly) {
    return [
      {
        percent: depositPct,
        label: 'Upon Contract Signing',
        description: 'Includes waterproofing materials and tile ordering',
      },
      {
        percent: progressPct,
        label: 'At 50% Tile Completion',
        description: 'Substrate prep and waterproofing complete',
      },
      {
        percent: finalPct,
        label: 'At Project Completion',
        description: 'All tile installed, grouted, and sealed',
      },
    ];
  }

  // Default fallback
  return [
    {
      percent: depositPct,
      label: 'Upon Contract Signing',
      description: 'Includes mobilization, materials ordering, and scheduling',
    },
    {
      percent: progressPct,
      label: 'At Project Midpoint',
      description: 'Major work complete, finishing in progress',
    },
    {
      percent: finalPct,
      label: 'At Project Completion',
      description: 'Final walkthrough and punchlist complete',
    },
  ];
}

/**
 * Estimate project timeline in working days based on scope
 */
function estimateTimeline(scope: ScopeAnalysis): number {
  let days = 5; // Base timeline

  if (scope.hasDemo) days += 2;
  if (scope.hasCabinets) days += 3;
  if (scope.hasGranite) days += 10; // Fabrication lead time
  if (scope.hasTile) days += 4;
  if (scope.hasPlumbing) days += 2;
  if (scope.hasFlooring) days += 2;
  if (scope.hasGlass) days += 3; // Glass lead time
  if (scope.hasPaint) days += 1;
  if (scope.hasElectrical) days += 1;

  // For tile-only, reduce timeline
  if (scope.isTileOnly) {
    return Math.min(days, 7);
  }

  return days;
}

/**
 * Generate dynamic project notes based on actual scope
 */
export function generateProjectNotes(estimate: Estimate, companyName: string = 'Our team'): string[] {
  const notes: string[] = [];
  const scope = analyzeScope(estimate);
  const timeline = estimateTimeline(scope);

  // Demo-specific note
  if (scope.hasDemo) {
    notes.push('Dumpster delivery will be scheduled for the first day of demolition. Please ensure clear access to the driveway or designated area.');
  }

  // Cabinet-specific note
  if (scope.hasCabinets) {
    if (scope.isKitchen) {
      notes.push('Cabinet installation typically scheduled 7-10 days after demolition, pending material delivery. Please plan for kitchen to be out of service during construction.');
    } else {
      notes.push('Vanity installation scheduled after all tile and paint work is complete.');
    }
  }

  // Granite/countertop-specific note
  if (scope.hasGranite) {
    notes.push('Countertop fabrication requires 10-14 day lead time after template. Customer will select exact slab at fabricator showroom.');
  }

  // Tile-specific note
  if (scope.hasTile) {
    notes.push('Waterproofing system requires 24-hour cure time before tile installation. Grout requires 48-hour cure before use.');
  }

  // Plumbing-specific note
  if (scope.hasPlumbing && (scope.isBathroom || scope.hasTile)) {
    notes.push('Plumbing rough-in will be inspected before covering with tile or drywall.');
  }

  // Flooring-specific note
  if (scope.hasFlooring) {
    notes.push('Flooring will be installed after all other work to prevent damage during construction.');
  }

  // Glass-specific note
  if (scope.hasGlass) {
    notes.push('Frameless glass fabrication requires field measurements after tile completion. Allow 7-10 days for fabrication.');
  }

  // Dust protection note (only if demo or significant work)
  if (scope.hasDemo || scope.hasTile) {
    notes.push(`${companyName} will take reasonable precautions to minimize dust and disruption, including floor protection, dust barriers, and daily cleanup.`);
  }

  // Timeline note (dynamic based on scope)
  notes.push(`Estimated project timeline is approximately ${timeline} working days from start date, pending material lead times.`);

  // Standard notes
  notes.push('Permits, if required, are EXCLUDED from this proposal unless noted otherwise.');
  notes.push('This estimate is valid for 30 days. Final pricing subject to site conditions and material selections.');

  return notes;
}

/**
 * Get the appropriate progress milestone label based on project type
 */
export function getProgressMilestoneLabel(estimate: Estimate): string {
  const scope = analyzeScope(estimate);

  if (scope.isKitchen && scope.hasCabinets) {
    return 'Due at arrival of cabinetry';
  }
  
  if (scope.isTileOnly) {
    return 'At 50% tile completion';
  }
  
  if (scope.isBathroom && scope.hasTile) {
    return 'Due at start of tile installation';
  }

  return 'At project midpoint';
}
