/**
 * TKBSO Quote Pro — Save Estimate to Supabase + GHL
 *
 * Maps the chat estimator's EstimateState + EstimateBreakdown
 * to the Supabase estimates table, then syncs to GHL.
 */

import { supabase } from '@/integrations/supabase/client';
import { pushQuoteToGhl, GHL_PIPELINE_ID, GHL_STAGES } from './ghl-integration';
import type { EstimateState, EstimateBreakdown, TradeLine } from './chatFlow';

interface SaveResult {
  estimateId: string | null;
  ghlContactId: string | null;
  ghlOpportunityId: string | null;
  error: string | null;
}

/**
 * Find a trade line's IC and CP from the breakdown.
 */
function findTrade(trades: TradeLine[], nameIncludes: string): { ic: number; cp: number } {
  const matching = trades.filter(t => t.name.toLowerCase().includes(nameIncludes.toLowerCase()));
  return {
    ic: matching.reduce((s, t) => s + t.ic, 0),
    cp: matching.reduce((s, t) => s + t.cp, 0),
  };
}

/**
 * Save a completed chat estimate to Supabase and sync to GHL.
 */
export async function saveEstimate(
  state: Partial<EstimateState>,
  breakdown: EstimateBreakdown,
  contractorId: string,
  profileId?: string | null,
): Promise<SaveResult> {
  const result: SaveResult = {
    estimateId: null,
    ghlContactId: null,
    ghlOpportunityId: null,
    error: null,
  };

  try {
    const room = state.roomType || '';
    const isBath = ['Primary Bathroom', 'Guest Bathroom', 'Tub-to-Shower Conversion'].includes(room);
    const isKitchen = room === 'Kitchen';

    // Map project type
    let projectType = 'other';
    if (isBath) projectType = 'bathroom';
    if (isKitchen) projectType = 'kitchen';
    if (room === 'Multiple Rooms') projectType = 'both';

    // Extract trade totals from breakdown
    const demo = findTrade(breakdown.trades, 'demo');
    const plumbing = findTrade(breakdown.trades, 'plumb');
    const tile = findTrade(breakdown.trades, 'tile');
    const waterproof = findTrade(breakdown.trades, 'waterproof');
    const cementBoard = findTrade(breakdown.trades, 'cement');
    const glass = findTrade(breakdown.trades, 'glass');
    const electrical = findTrade(breakdown.trades, 'electr');
    const paint = findTrade(breakdown.trades, 'paint');
    const vanity = findTrade(breakdown.trades, 'vanity');
    const countertop = findTrade(breakdown.trades, 'countertop');
    const cabinet = findTrade(breakdown.trades, 'cabinet');
    const dumpster = findTrade(breakdown.trades, 'dumpster');
    const framing = findTrade(breakdown.trades, 'framing');
    const support = findTrade(breakdown.trades, 'support');

    // Build the Supabase payload
    const payload: Record<string, unknown> = {
      contractor_id: contractorId,
      created_by_profile_id: profileId || null,

      // Client info
      job_label: `${room} — ${state.customerName || 'Unnamed'}`,
      client_name: state.customerName || null,
      client_email: state.customerEmail || null,
      client_phone: state.customerPhone || null,
      property_address: state.customerAddress || null,
      project_type: projectType,

      // Room flags
      has_kitchen: isKitchen || room === 'Multiple Rooms',
      has_bathrooms: isBath || room === 'Multiple Rooms',
      has_closets: false,

      // Bathroom scope
      total_bathroom_sqft: 0,
      num_bathrooms: isBath ? 1 : 0,
      bath_scope_level: state.pricingTier || 'Standard',
      bath_wall_tile_sqft: state.bathTileWallSqft || 0,
      bath_floor_tile_sqft: state.bathTileFloorSqft || 0,
      bath_shower_floor_tile_sqft: 14,
      bath_uses_frameless_glass: (state.bathGlass || '') !== 'No Glass' && (state.bathGlass || '') !== '',
      vanity_size: state.bathVanitySize || '',
      glass_type: state.bathGlass || '',

      // Kitchen scope
      total_kitchen_sqft: 0,
      num_kitchens: isKitchen ? 1 : 0,
      kitchen_scope_level: state.pricingTier || 'Standard',
      kitchen_countertop_sqft: state.kitchenCountertopSqft || 0,
      kitchen_uses_tkbso_cabinets: state.kitchenCabinets === 'Full Replace (KCC)',

      // Trade toggles
      include_demo: !!state.bathDemo || !!state.kitchenDemo,
      include_plumbing: plumbing.ic > 0,
      include_electrical: electrical.ic > 0,
      include_paint: paint.ic > 0,
      include_glass: glass.ic > 0,
      include_waterproofing: waterproof.ic > 0,

      // Counts
      num_recessed_cans: (state.bathExtras || []).includes('recessed_cans') ? 3 : 0,
      num_toilets: (state.bathExtras || []).includes('new_toilet') ? 1 : 0,
      num_vanity_lights: 1,

      // IC totals by trade
      demo_ic_total: demo.ic + dumpster.ic,
      plumbing_ic_total: plumbing.ic,
      waterproofing_ic_total: waterproof.ic,
      paint_ic_total: paint.ic,
      tile_ic_total: tile.ic,
      cement_board_ic_total: cementBoard.ic,
      quartz_ic_total: countertop.ic,
      cabinets_ic_total: cabinet.ic,
      vanities_ic_total: vanity.ic,
      glass_ic_total: glass.ic,
      lighting_ic_total: electrical.ic,
      other_ic_total: framing.ic + support.ic,
      final_ic_total: breakdown.subtotalIc,

      // CP totals by trade
      demo_cp_total: demo.cp + dumpster.cp,
      plumbing_cp_total: plumbing.cp,
      waterproofing_cp_total: waterproof.cp,
      paint_cp_total: paint.cp,
      tile_cp_total: tile.cp,
      cement_board_cp_total: cementBoard.cp,
      quartz_cp_total: countertop.cp,
      cabinets_cp_total: cabinet.cp,
      vanities_cp_total: vanity.cp,
      glass_cp_total: glass.cp,
      lighting_cp_total: electrical.cp,
      other_cp_total: framing.cp + support.cp,
      final_cp_total: breakdown.subtotalCp,
      low_estimate_cp: Math.round(breakdown.subtotalCp * 0.95),
      high_estimate_cp: Math.round(breakdown.subtotalCp * 1.05),

      // Full state snapshot for PDF generation later
      internal_json_payload: {
        chatState: state,
        breakdown: breakdown,
        savedAt: new Date().toISOString(),
        version: 'chat-v2',
      },

      status: 'draft',
      job_notes: state.roomDimensions ? `Room: ${state.roomDimensions}` : null,
    };

    // Insert to Supabase
    const { data, error } = await supabase
      .from('estimates')
      .insert(payload)
      .select('id')
      .single();

    if (error) throw error;
    result.estimateId = data?.id || null;

    // Sync to GHL
    try {
      const ghlResult = await pushQuoteToGhl({
        customerName: state.customerName,
        customerAddress: state.customerAddress,
        customerPhone: state.customerPhone,
        customerEmail: state.customerEmail,
        roomType: room,
        grandTotal: breakdown.subtotalCp,
        quoteNumber: result.estimateId?.slice(0, 8) || undefined,
        status: 'draft',
      });
      result.ghlContactId = ghlResult.contactId;
      result.ghlOpportunityId = ghlResult.opportunityId;
    } catch (ghlErr: any) {
      console.warn('[saveEstimate] GHL sync failed:', ghlErr.message);
      // Don't fail the save if GHL sync fails
    }

  } catch (err: any) {
    result.error = err.message;
    console.error('[saveEstimate] Failed:', err);
  }

  return result;
}
