/**
 * TKBSO Quote Pro — GoHighLevel Integration
 *
 * Syncs quotes to GHL as contacts + opportunities.
 * Uses the GHL API v2 (via MCP or direct REST).
 *
 * Flow:
 *   1. Quote created → upsert GHL contact (by email or phone)
 *   2. Quote saved → create/update GHL opportunity in pipeline
 *   3. Quote status change → move opportunity stage
 *   4. Follow-ups handled by GHL workflows (not Supabase Edge Functions)
 *
 * Location ID: euXH15G0pqPgr497kAL2 (Voxaris LLC)
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GhlContactPayload {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  source?: string;
  tags?: string[];
  customField?: Record<string, string>;
}

export interface GhlOpportunityPayload {
  pipelineId: string;
  stageId: string;
  contactId: string;
  name: string;
  monetaryValue?: number;
  status?: 'open' | 'won' | 'lost' | 'abandoned';
}

export interface GhlSyncResult {
  contactId: string | null;
  opportunityId: string | null;
  errors: string[];
}

// ─── Quote Status → GHL Stage Mapping ─────────────────────────────────────────

// These IDs need to be set after checking your GHL pipeline stages.
// For now, using placeholder keys — replace with real stage IDs from your pipeline.
export const QUOTE_STATUS_TO_GHL_STAGE: Record<string, string> = {
  draft: 'draft',           // Replace with real stage ID
  sent: 'sent',             // Replace with real stage ID
  viewed: 'viewed',         // Replace with real stage ID
  approved: 'won',          // Replace with real stage ID
  declined: 'lost',         // Replace with real stage ID
  expired: 'lost',          // Replace with real stage ID
};

// ─── Tags ─────────────────────────────────────────────────────────────────────

function getQuoteTags(projectType: string, source: string): string[] {
  const tags = ['tkbso-quote-pro', `project-${projectType.toLowerCase().replace(/\s+/g, '-')}`];
  if (source) tags.push(`source-${source}`);
  return tags;
}

// ─── Build GHL Contact from Quote State ───────────────────────────────────────

export function buildGhlContact(quoteState: {
  customerName?: string;
  customerAddress?: string;
  customerPhone?: string;
  customerEmail?: string;
  roomType?: string;
}): GhlContactPayload {
  const nameParts = (quoteState.customerName || '').trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  // Try to parse address
  const address = quoteState.customerAddress || '';
  const addressParts = address.split(',').map(s => s.trim());

  return {
    firstName,
    lastName,
    email: quoteState.customerEmail || undefined,
    phone: quoteState.customerPhone || undefined,
    address1: addressParts[0] || undefined,
    city: addressParts[1] || 'Orlando',
    state: addressParts[2]?.replace(/\d/g, '').trim() || 'FL',
    postalCode: addressParts[2]?.match(/\d{5}/)?.[0] || undefined,
    source: 'TKBSO Quote Pro',
    tags: getQuoteTags(quoteState.roomType || 'remodel', 'quote-pro'),
  };
}

// ─── Build GHL Opportunity from Quote ─────────────────────────────────────────

export function buildGhlOpportunity(
  contactId: string,
  pipelineId: string,
  stageId: string,
  quoteState: {
    customerName?: string;
    roomType?: string;
    grandTotal?: number;
  },
): GhlOpportunityPayload {
  return {
    pipelineId,
    stageId,
    contactId,
    name: `${quoteState.roomType || 'Remodel'} — ${quoteState.customerName || 'Unknown'}`,
    monetaryValue: quoteState.grandTotal || 0,
    status: 'open',
  };
}

// ─── GHL API Client (direct REST, for when MCP isn't available) ───────────────

const GHL_API_BASE = 'https://services.leadconnectorhq.com';
const GHL_LOCATION_ID = 'euXH15G0pqPgr497kAL2';

export class GhlClient {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async request(path: string, options: RequestInit = {}): Promise<any> {
    const response = await fetch(`${GHL_API_BASE}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        Version: '2021-07-28',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`GHL API ${response.status}: ${err}`);
    }

    return response.json();
  }

  // Search for existing contact by email or phone
  async findContact(query: string): Promise<any | null> {
    try {
      const data = await this.request(
        `/contacts/search/duplicate?locationId=${GHL_LOCATION_ID}&${query.includes('@') ? 'email' : 'phone'}=${encodeURIComponent(query)}`
      );
      return data?.contact || null;
    } catch {
      return null;
    }
  }

  // Create or update contact
  async upsertContact(payload: GhlContactPayload): Promise<string | null> {
    // Try to find existing contact first
    const searchKey = payload.email || payload.phone;
    if (searchKey) {
      const existing = await this.findContact(searchKey);
      if (existing?.id) {
        // Update existing
        await this.request(`/contacts/${existing.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        return existing.id;
      }
    }

    // Create new
    const data = await this.request('/contacts/', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        locationId: GHL_LOCATION_ID,
      }),
    });
    return data?.contact?.id || null;
  }

  // Create opportunity
  async createOpportunity(payload: GhlOpportunityPayload): Promise<string | null> {
    const data = await this.request('/opportunities/', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        locationId: GHL_LOCATION_ID,
      }),
    });
    return data?.opportunity?.id || null;
  }

  // Update opportunity status/stage
  async updateOpportunity(opportunityId: string, updates: Partial<GhlOpportunityPayload>): Promise<void> {
    await this.request(`/opportunities/${opportunityId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // List pipelines
  async listPipelines(): Promise<any[]> {
    const data = await this.request(`/opportunities/pipelines?locationId=${GHL_LOCATION_ID}`);
    return data?.pipelines || [];
  }

  // Add note to contact
  async addContactNote(contactId: string, body: string): Promise<void> {
    await this.request(`/contacts/${contactId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ body, userId: contactId }),
    });
  }

  // Add tags to contact
  async addTags(contactId: string, tags: string[]): Promise<void> {
    await this.request(`/contacts/${contactId}/tags`, {
      method: 'POST',
      body: JSON.stringify({ tags }),
    });
  }
}

// ─── Full Sync Function ───────────────────────────────────────────────────────

/**
 * Sync a quote to GHL: upsert contact, create opportunity, add note.
 * Call this when a quote is saved or status changes.
 */
export async function syncQuoteToGhl(
  token: string,
  pipelineId: string,
  stageId: string,
  quoteState: {
    customerName?: string;
    customerAddress?: string;
    customerPhone?: string;
    customerEmail?: string;
    roomType?: string;
    grandTotal?: number;
    quoteNumber?: string;
  },
): Promise<GhlSyncResult> {
  const client = new GhlClient(token);
  const result: GhlSyncResult = { contactId: null, opportunityId: null, errors: [] };

  try {
    // 1. Upsert contact
    const contactPayload = buildGhlContact(quoteState);
    result.contactId = await client.upsertContact(contactPayload);

    if (!result.contactId) {
      result.errors.push('Failed to create/find GHL contact');
      return result;
    }

    // 2. Create opportunity
    const oppPayload = buildGhlOpportunity(result.contactId, pipelineId, stageId, quoteState);
    result.opportunityId = await client.createOpportunity(oppPayload);

    // 3. Add note with quote details
    if (result.contactId) {
      const noteBody = [
        `**Quote ${quoteState.quoteNumber || 'N/A'}**`,
        `Project: ${quoteState.roomType || 'Remodel'}`,
        `Total: $${(quoteState.grandTotal || 0).toLocaleString()}`,
        `Address: ${quoteState.customerAddress || 'N/A'}`,
        `Created via TKBSO Quote Pro`,
      ].join('\n');

      await client.addContactNote(result.contactId, noteBody);
    }
  } catch (error: any) {
    result.errors.push(error.message);
  }

  return result;
}
