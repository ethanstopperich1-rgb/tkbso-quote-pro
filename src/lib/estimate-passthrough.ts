/**
 * STRICT PASSTHROUGH UTILITIES FOR ESTIMATE DATA
 * 
 * These functions extract line items from estimates exactly as they were
 * created by the estimator - NO modifications, NO rewriting, NO grouping.
 * 
 * The document generator should be a DUMB RENDERER that displays what we give it.
 */

import { Estimate } from '@/types/database';

/**
 * A line item exactly as the estimator produces it.
 * The document should display these EXACTLY as-is.
 */
export interface PassthroughLineItem {
  name: string;        // Display name - shown exactly as-is
  quantity: number;    // Quantity
  unit: string;        // Unit (ea, sqft, ls, etc.)
  cost: number;        // Internal cost (not shown to customer)
  price: number;       // Customer price - shown in table
}

/**
 * Full estimate data in passthrough format.
 * This is what the document generator receives - it should NOT modify any of this.
 */
export interface PassthroughEstimateData {
  customerName: string;
  projectType: string;
  date: string;
  lineItems: PassthroughLineItem[];  // EXACT line items from estimator
  total: number;                      // Sum of all lineItem prices - pre-calculated
}

/**
 * Extracts line items from an estimate in strict passthrough format.
 * 
 * RULES:
 * - Every line item from internal_json_payload.pricing.line_items is included
 * - Names are NOT rewritten - we use task_description exactly as stored
 * - No grouping by trade - items stay in their original order
 * - No items are added that aren't in the data
 * - No items are skipped
 * 
 * @param estimate The estimate from the database
 * @returns Array of line items exactly as stored
 */
export function extractPassthroughLineItems(estimate: Estimate): PassthroughLineItem[] {
  const payload = estimate.internal_json_payload as Record<string, unknown> | null;
  
  if (!payload) {
    return [];
  }
  
  const pricing = payload.pricing as Record<string, unknown> | undefined;
  const storedLineItems = pricing?.line_items as Array<{
    category?: string;
    task_description: string;
    quantity?: number;
    unit?: string;
    ic_total?: number;
    cp_total?: number;
  }> | undefined;
  
  if (!storedLineItems || !Array.isArray(storedLineItems)) {
    return [];
  }
  
  // Map directly - NO modifications to descriptions
  return storedLineItems.map(item => ({
    name: item.task_description,  // Use EXACTLY as stored
    quantity: item.quantity || 1,
    unit: item.unit || 'ea',
    cost: item.ic_total || 0,
    price: item.cp_total || 0,
  }));
}

/**
 * Calculates total from line items.
 * This should match estimate.final_cp_total if everything is correct.
 * 
 * @param lineItems Array of passthrough line items
 * @returns Sum of all prices
 */
export function calculatePassthroughTotal(lineItems: PassthroughLineItem[]): number {
  return lineItems.reduce((sum, item) => sum + item.price, 0);
}

/**
 * Builds complete passthrough estimate data for document generation.
 * 
 * @param estimate The estimate from the database
 * @returns Complete data structure ready for document generation
 */
export function buildPassthroughEstimateData(estimate: Estimate): PassthroughEstimateData {
  const lineItems = extractPassthroughLineItems(estimate);
  
  // Use the stored total - do NOT recalculate unless it's clearly wrong
  const storedTotal = estimate.final_cp_total || 0;
  const calculatedTotal = calculatePassthroughTotal(lineItems);
  
  // Use stored total if it exists and is reasonable, otherwise use calculated
  const total = storedTotal > 0 ? storedTotal : calculatedTotal;
  
  return {
    customerName: estimate.client_name || 'Valued Customer',
    projectType: estimate.has_kitchen && !estimate.has_bathrooms 
      ? 'Kitchen' 
      : estimate.has_bathrooms 
        ? 'Bathroom' 
        : 'Remodel',
    date: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    lineItems,
    total,
  };
}

/**
 * Validates that line items match the stored total.
 * Useful for debugging discrepancies.
 * 
 * @param estimate The estimate from the database
 * @returns Object with validation results
 */
export function validateEstimateConsistency(estimate: Estimate): {
  isValid: boolean;
  storedTotal: number;
  calculatedTotal: number;
  lineItemCount: number;
  discrepancy: number;
} {
  const lineItems = extractPassthroughLineItems(estimate);
  const storedTotal = estimate.final_cp_total || 0;
  const calculatedTotal = calculatePassthroughTotal(lineItems);
  const discrepancy = Math.abs(storedTotal - calculatedTotal);
  
  return {
    isValid: discrepancy < 1, // Allow $1 rounding difference
    storedTotal,
    calculatedTotal,
    lineItemCount: lineItems.length,
    discrepancy,
  };
}
