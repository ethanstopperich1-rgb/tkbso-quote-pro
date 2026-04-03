import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import { Contractor, Estimate, PricingConfig } from '@/types/database';
import { ContractorSettings, defaultSettings } from '@/types/settings';
import { extractPassthroughLineItems, calculatePassthroughTotal } from '@/lib/estimate-passthrough';
import tkbsoLogo from '@/assets/tkbso-logo-full.png';

// =============================================================================
// STYLES — clean, Word-document style matching real TKB SO sold quotes
// =============================================================================
const NAVY = '#1e3a8a';
const GRAY = '#64748b';
const BLACK = '#1e293b';
const CYAN = '#0891b2';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 100,
    paddingBottom: 60,
    paddingHorizontal: 50,
    backgroundColor: '#ffffff',
    color: BLACK,
    lineHeight: 1.45,
  },

  // Fixed header with logo on every page
  headerBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 20,
    paddingBottom: 14,
    paddingHorizontal: 50,
    alignItems: 'center',
  },
  logo: {
    width: 210,
    height: 'auto',
  },

  // Title block — centered, bold
  titleBlock: {
    alignItems: 'center',
    marginBottom: 18,
  },
  titleLine: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: BLACK,
    textAlign: 'center',
    textDecoration: 'underline',
  },
  titleAddress: {
    fontSize: 11,
    color: BLACK,
    textAlign: 'center',
    marginTop: 2,
  },

  // Section heading — centered, bold, underlined
  sectionHeadingCenter: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: BLACK,
    textAlign: 'center',
    textDecoration: 'underline',
    marginTop: 14,
    marginBottom: 10,
  },

  // Room heading — bold, left-aligned
  roomHeading: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: BLACK,
    marginTop: 10,
    marginBottom: 6,
  },

  // Demo paragraph — flowing narrative text
  demoParagraph: {
    fontSize: 10,
    color: BLACK,
    lineHeight: 1.5,
    marginBottom: 8,
  },

  // "Remodel work to be done:" heading
  remodelHeading: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: BLACK,
    marginTop: 6,
    marginBottom: 6,
  },

  // Trade sub-heading (PLUMBING:, ELECTRICAL:, etc.)
  tradeHeading: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: BLACK,
    textDecoration: 'underline',
    marginTop: 8,
    marginBottom: 4,
  },

  // Bullet item with dash
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 0,
  },
  bulletDash: {
    width: 14,
    fontSize: 10,
    color: BLACK,
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    color: BLACK,
    lineHeight: 1.5,
  },

  // Additional item (cyan/blue with price)
  additionalBulletText: {
    flex: 1,
    fontSize: 10,
    color: CYAN,
    lineHeight: 1.5,
  },

  // Total line
  totalLine: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: BLACK,
    marginTop: 16,
    marginBottom: 12,
  },

  // Payment milestones section
  paymentHeading: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: BLACK,
    textDecoration: 'underline',
    marginTop: 10,
    marginBottom: 6,
  },
  paymentLine: {
    fontSize: 10,
    color: BLACK,
    marginBottom: 3,
    lineHeight: 1.4,
  },

  // Additional items section heading
  additionalHeading: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: CYAN,
    textDecoration: 'underline',
    marginTop: 14,
    marginBottom: 6,
  },

  // Signature section
  signatureSection: {
    marginTop: 24,
  },
  signatureLabel: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: BLACK,
    marginTop: 12,
    marginBottom: 2,
  },
  signatureRow: {
    flexDirection: 'row',
    marginTop: 4,
    marginBottom: 8,
    gap: 30,
  },
  signatureField: {
    flex: 1,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: BLACK,
    height: 22,
    marginBottom: 3,
  },
  signatureFieldLabel: {
    fontSize: 9,
    color: GRAY,
  },

  // Project notes
  notesSection: {
    marginTop: 20,
  },
  noteItem: {
    marginBottom: 8,
  },
  noteLabel: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: BLACK,
  },
  noteText: {
    fontSize: 9,
    color: BLACK,
    lineHeight: 1.5,
  },

  // Footer
  pageFooter: {
    position: 'absolute',
    bottom: 25,
    left: 50,
    right: 50,
    textAlign: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#94a3b8',
  },
});

// =============================================================================
// PASSTHROUGH & ADDITIONAL ITEM INTERFACES (kept for backward compat)
// =============================================================================
export interface PassthroughLineItem {
  name: string;
  quantity: number;
  unit: string;
  cost: number;
  price: number;
  room_label?: string;
}

export interface Additional {
  id: string;
  description: string;
  details?: string;
  price: number;
  category?: string;
}

// =============================================================================
// PROPS — supports both legacy (lineItems/total) and new (estimate/pricingConfig)
// =============================================================================
export interface SimpleProposalPdfProps {
  estimate: Estimate;
  contractor: Contractor;
  pricingConfig?: PricingConfig | null;
  selectedPrice?: number;
  showRange?: boolean;
  showDualPricing?: boolean;
  // Legacy props — still accepted from SendProposalDialog
  lineItems?: PassthroughLineItem[];
  total?: number;
  lowEstimate?: number;
  highEstimate?: number;
  showPriceRange?: boolean;
  marketPriceMultiplier?: number;
}

// =============================================================================
// HELPERS
// =============================================================================
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Trade classification — same order as real quotes
const TRADE_ORDER = [
  'PLUMBING',
  'ELECTRICAL',
  'DRYWALL & FRAMING',
  'TILE WORK',
  'CABINET & COUNTERTOP',
  'GLASS',
  'PAINTING & FINAL TRIMOUT',
  'OTHER',
] as const;

function classifyTrade(itemName: string): string {
  const name = itemName.toLowerCase();

  if (name.includes('plumb') || name.includes('toilet') || name.includes('faucet') ||
      name.includes('drain') || name.includes('shower head') || name.includes('supply line') ||
      name.includes('tub') || name.includes('shower valve') || name.includes('trim kit') ||
      name.includes('reconnect') || name.includes('shower kit') || name.includes('sink') ||
      name.includes('diverter') || name.includes('wax ring') || name.includes('shut-off'))
    return 'PLUMBING';

  if (name.includes('electric') || name.includes('outlet') || name.includes('switch') ||
      name.includes('recessed') || name.includes('can light') || name.includes('wiring') ||
      name.includes('led') || name.includes('vanity light') || name.includes('sconce') ||
      name.includes('gfci') || name.includes('decora') || name.includes('mirror') ||
      name.includes('light fixture'))
    return 'ELECTRICAL';

  if (name.includes('drywall') || name.includes('fram') || name.includes('patch') ||
      name.includes('pocket door') || name.includes('niche') || name.includes('blocking') ||
      name.includes('bulkhead') || name.includes('curb'))
    return 'DRYWALL & FRAMING';

  if (name.includes('tile') || name.includes('waterproof') || name.includes('cement board') ||
      name.includes('grout') || name.includes('thinset') || name.includes('schluter') ||
      name.includes('mud bed') || name.includes('wainscot') || name.includes('mosaic') ||
      name.includes('porcelain'))
    return 'TILE WORK';

  if (name.includes('cabinet') || name.includes('vanity') || name.includes('countertop') ||
      name.includes('quartz') || name.includes('shaker') || name.includes('undermount') ||
      name.includes('floating shelf') || name.includes('hardware') || name.includes('crown molding'))
    return 'CABINET & COUNTERTOP';

  if (name.includes('glass') || name.includes('shower door') || name.includes('frameless') ||
      name.includes('enclosure'))
    return 'GLASS';

  if (name.includes('paint') || name.includes('baseboard') || name.includes('trim') ||
      name.includes('towel') || name.includes('toilet paper') || name.includes('tp holder') ||
      name.includes('finish') || name.includes('door trim'))
    return 'PAINTING & FINAL TRIMOUT';

  return 'OTHER';
}

function groupItemsByTrade(items: PassthroughLineItem[]): Map<string, PassthroughLineItem[]> {
  const grouped = new Map<string, PassthroughLineItem[]>();
  for (const item of items) {
    const trade = classifyTrade(item.name);
    if (!grouped.has(trade)) grouped.set(trade, []);
    grouped.get(trade)!.push(item);
  }
  // Sort by canonical trade order
  const sorted = new Map<string, PassthroughLineItem[]>();
  for (const trade of TRADE_ORDER) {
    if (grouped.has(trade)) sorted.set(trade, grouped.get(trade)!);
  }
  return sorted;
}

// Separate demo items from scope items
function separateDemoItems(items: PassthroughLineItem[]): {
  demoItems: PassthroughLineItem[];
  scopeItems: PassthroughLineItem[];
} {
  const demoItems: PassthroughLineItem[] = [];
  const scopeItems: PassthroughLineItem[] = [];
  for (const item of items) {
    const n = item.name.toLowerCase();
    if (n.includes('demo') || n.includes('gut') || n.includes('removal') ||
        n.includes('remove') || n.includes('haul away') || n.includes('dumpster') ||
        n.includes('debris') || n.includes('dispose'))
      demoItems.push(item);
    else
      scopeItems.push(item);
  }
  return { demoItems, scopeItems };
}

// Build a narrative demo paragraph from demo line items
function buildDemoParagraph(demoItems: PassthroughLineItem[]): string {
  if (demoItems.length === 0) return '';
  // Combine all demo descriptions into one flowing paragraph
  const combined = demoItems.map(d => d.name).join('. ');
  // If it already reads like a narrative, use as-is
  if (combined.toLowerCase().startsWith('demo')) return combined;
  return `Demo, remove & haul away the following materials from the remodel area: ${combined}.`;
}

// Format a scope bullet — inline allowances and sqft like real quotes
function formatScopeBullet(item: PassthroughLineItem): string {
  let text = item.name;
  // Append sqft if present and > 1
  if (item.unit === 'sqft' && item.quantity > 1) {
    if (!text.toLowerCase().includes('sq ft') && !text.toLowerCase().includes('sqft')) {
      text += ` (approx. ${Math.round(item.quantity)} sq ft)`;
    }
  }
  return text;
}

// Group line items by room_label
function groupByRoom(
  items: PassthroughLineItem[],
  estimate: Estimate,
): Map<string, PassthroughLineItem[]> {
  const grouped = new Map<string, PassthroughLineItem[]>();
  const uniqueRooms = new Set(
    items.filter(i => i.room_label && i.room_label.trim()).map(i => i.room_label!),
  );
  const bathroomCount = estimate.num_bathrooms || 1;
  const isSingle = bathroomCount === 1 && uniqueRooms.size <= 1;
  if (isSingle) {
    const label = uniqueRooms.size === 1 ? Array.from(uniqueRooms)[0] : 'Primary Bathroom';
    grouped.set(label, items);
    return grouped;
  }
  for (const item of items) {
    const key = item.room_label || '_general';
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(item);
  }
  return grouped;
}

// Get additionals from estimate payload
function getAdditionals(estimate: Estimate): Additional[] {
  const payload = estimate.internal_json_payload as Record<string, unknown> | null;
  return (payload?.additionals as Additional[]) || [];
}

// Build a room dimensions string from estimate data
function getRoomDimensions(estimate: Estimate): string {
  // Try to get from internal_json_payload first
  const payload = estimate.internal_json_payload as Record<string, unknown> | null;
  const chatBreakdown = payload?.chat_breakdown as Record<string, unknown> | undefined;
  if (chatBreakdown?.room_dimensions) return chatBreakdown.room_dimensions as string;
  // Fall back to computed sqft
  if (estimate.total_bathroom_sqft && estimate.total_bathroom_sqft > 0) {
    return `${Math.round(estimate.total_bathroom_sqft)} sq ft`;
  }
  return '';
}

// Determine project type label
function getProjectTypeLabel(estimate: Estimate): string {
  if (estimate.has_kitchen && estimate.has_bathrooms) return 'Kitchen & Bathroom';
  if (estimate.has_kitchen) return 'Kitchen';
  if (estimate.has_bathrooms) return 'Bathroom';
  return 'Remodel';
}

// Standard TKBSO project notes — matches real sold quotes
const TKBSO_NOTES = [
  {
    label: 'Note I:',
    text: 'A dumpster will be delivered to your home 1 to 2 days prior to the actual start date of the project. Please open-up one half the garage for material delivery & ongoing storage of worker tools.',
  },
  {
    label: 'Note II:',
    text: 'Keeping in mind this is a construction project, TKBSO will make efforts to minimize the dust and noise created from the work and keep it localized to the specific remodel areas. This will be done in advance of commencement and "as needed" throughout the construction process. Prep work includes, but is not limited to: (1) Laying temporary "walk paths" to protect existing tile, wood floors, (2) taping off AC vents, (3) bottom door gaps.',
  },
  {
    label: 'Note III:',
    text: 'All work, including plumbing and electrical work will be done by licensed and insured tradesman.',
  },
  {
    label: 'Note IV:',
    text: 'Subject to availability, the bathroom remodel will take approximately 14+ working days to complete.',
  },
];

// =============================================================================
// COMPONENT
// =============================================================================
export function SimpleProposalPdf(props: SimpleProposalPdfProps) {
  const {
    estimate,
    contractor,
    selectedPrice,
    showRange = false,
    showPriceRange = false,
  } = props;

  // Resolve line items — support legacy direct props or extract from estimate
  const lineItems: PassthroughLineItem[] =
    props.lineItems && props.lineItems.length > 0
      ? props.lineItems
      : extractPassthroughLineItems(estimate);

  // Resolve total price
  const total: number =
    props.total && props.total > 0
      ? props.total
      : selectedPrice && selectedPrice > 0
        ? selectedPrice
        : estimate.final_cp_total || calculatePassthroughTotal(lineItems);

  // Settings
  const settings: ContractorSettings =
    (contractor.settings as ContractorSettings) || defaultSettings;
  const { defaults: settingsDefaults } = settings;

  // Payment splits — 65/25/10 is TKBSO standard
  const depositPct = (settingsDefaults?.depositPct || 65) / 100;
  const progressPct = (settingsDefaults?.progressPct || 25) / 100;
  const finalPct = (settingsDefaults?.finalPct || 10) / 100;
  const depositAmount = Math.round(total * depositPct);
  const progressAmount = Math.round(total * progressPct);
  const finalAmount = Math.round(total * finalPct);

  // Customer info
  const clientName = estimate.client_name || 'Valued Customer';
  const propertyAddress = estimate.property_address || '';
  const cityStateZip = [estimate.city, estimate.state, estimate.zip]
    .filter(Boolean)
    .join(', ')
    .replace(/,\s*,/g, ',');

  // Room dimensions
  const roomDims = getRoomDimensions(estimate);
  const projectType = getProjectTypeLabel(estimate);

  // Group items by room
  const roomGroups = groupByRoom(lineItems, estimate);
  const roomEntries = Array.from(roomGroups.entries());

  // Additionals
  const additionals = getAdditionals(estimate);

  // Custom notes from estimate
  const customNoteText = estimate.job_notes || '';

  // Logo source
  const logoSrc = contractor.logo_url || tkbsoLogo;

  // Determine room heading for each group
  function buildRoomHeading(roomLabel: string): string {
    if (roomLabel === '_general') return 'Scope of Work';
    const dimsStr = roomDims ? ` (${roomDims})` : '';
    // If the room label already includes dims, skip appending
    if (roomLabel.includes('(') || roomLabel.includes('x') || roomLabel.includes('sq ft'))
      return roomLabel;
    return `${roomLabel}${dimsStr}`;
  }

  return (
    <Document>
      <Page size="LETTER" style={styles.page} wrap>
        {/* ---- FIXED HEADER: Logo on every page ---- */}
        <View style={styles.headerBanner} fixed>
          <Image src={logoSrc} style={styles.logo} />
        </View>

        {/* ---- TITLE BLOCK ---- */}
        <View style={styles.titleBlock} wrap={false}>
          <Text style={styles.titleLine}>
            Project For {clientName}
          </Text>
          {propertyAddress ? (
            <Text style={styles.titleAddress}>{propertyAddress}</Text>
          ) : null}
          {cityStateZip ? (
            <Text style={styles.titleAddress}>{cityStateZip}</Text>
          ) : null}
        </View>

        {/* ---- "Description of work to be preformed" ---- */}
        <Text style={styles.sectionHeadingCenter}>
          Description of work to be preformed
        </Text>

        {/* ---- ROOM SECTIONS ---- */}
        {roomEntries.map(([roomLabel, roomItems]) => {
          const { demoItems, scopeItems } = separateDemoItems(roomItems);
          const demoParagraph = buildDemoParagraph(demoItems);
          const heading = buildRoomHeading(roomLabel);

          // Group scope items by trade
          const tradeGroups = groupItemsByTrade(scopeItems);
          const tradeEntries = Array.from(tradeGroups.entries());
          // If there are few trades or items, skip trade sub-headings and just list bullets
          const useTradeSections = tradeEntries.length > 2 || scopeItems.length > 8;

          return (
            <View key={roomLabel}>
              {/* Room heading */}
              <Text style={styles.roomHeading}>{heading}</Text>

              {/* Demo paragraph — narrative, not bulleted */}
              {demoParagraph ? (
                <Text style={styles.demoParagraph}>{demoParagraph}</Text>
              ) : null}

              {/* "Remodel work to be done:" */}
              {scopeItems.length > 0 && (
                <Text style={styles.remodelHeading}>
                  Remodel work to be done{roomLabel !== '_general' ? ` in ${roomLabel.replace(/\s*\([^)]*\)\s*$/, '')}` : ''}:
                </Text>
              )}

              {/* Scope items — with or without trade sub-headings */}
              {useTradeSections
                ? tradeEntries.map(([tradeName, tradeItems]) => (
                    <View key={tradeName}>
                      <Text style={styles.tradeHeading}>{tradeName}:</Text>
                      {tradeItems.map((item, idx) => (
                        <View key={`${tradeName}-${idx}`} style={styles.bulletItem}>
                          <Text style={styles.bulletDash}>{'\u2212'} </Text>
                          <Text style={styles.bulletText}>
                            {formatScopeBullet(item)}
                            {item.price > 0 && item.price !== total
                              ? `. ${formatCurrency(item.price)}`
                              : ''}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ))
                : scopeItems.map((item, idx) => (
                    <View key={`scope-${idx}`} style={styles.bulletItem}>
                      <Text style={styles.bulletDash}>{'\u2212'} </Text>
                      <Text style={styles.bulletText}>
                        {formatScopeBullet(item)}
                        {item.price > 0 && item.price !== total
                          ? `. ${formatCurrency(item.price)}`
                          : ''}
                      </Text>
                    </View>
                  ))}
            </View>
          );
        })}

        {/* ---- TOTAL ---- */}
        <Text style={styles.totalLine}>
          {(showRange || showPriceRange) &&
          props.lowEstimate &&
          props.highEstimate &&
          props.lowEstimate !== props.highEstimate
            ? `Total: ${formatCurrency(props.lowEstimate)} \u2013 ${formatCurrency(props.highEstimate)}`
            : `Total: ${formatCurrency(total)}`}
        </Text>

        {/* ---- PAYMENT MILESTONES ---- */}
        <View wrap={false}>
          <Text style={styles.paymentHeading}>Payment Milestones:</Text>
          <Text style={styles.paymentLine}>
            {formatCurrency(depositAmount)} {'\u2013'} 5 days prior to the start of the remodel
          </Text>
          <Text style={styles.paymentLine}>
            {formatCurrency(progressAmount)} {'\u2013'} upon completion of tile work and vanity install
          </Text>
          <Text style={styles.paymentLine}>
            {formatCurrency(finalAmount)} {'\u2013'} overall completion (quartz top/shower glass and hardware trim-out)
          </Text>
        </View>

        {/* ---- ADDITIONAL ITEMS ---- */}
        {additionals.length > 0 && (
          <View>
            <Text style={styles.additionalHeading}>
              Additional Items (not included in the price above):
            </Text>
            {additionals.map((item, idx) => (
              <View key={item.id || idx} style={styles.bulletItem}>
                <Text style={styles.bulletDash}>{'\u2212'} </Text>
                <Text style={styles.additionalBulletText}>
                  {item.description}
                  {item.details ? ` - ${item.details}` : ''}
                  {' '}{formatCurrency(item.price)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ---- SIGNATURE BLOCKS ---- */}
        <View style={styles.signatureSection} wrap={false}>
          <Text style={styles.signatureLabel}>Approval (Homeowner):</Text>
          <View style={styles.signatureRow}>
            <View style={styles.signatureField}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureFieldLabel}>Sign</Text>
            </View>
            <View style={styles.signatureField}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureFieldLabel}>Date</Text>
            </View>
          </View>

          <Text style={styles.signatureLabel}>Accepted by (TKBSO)</Text>
          <View style={styles.signatureRow}>
            <View style={styles.signatureField}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureFieldLabel}>Sign</Text>
            </View>
            <View style={styles.signatureField}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureFieldLabel}>Date</Text>
            </View>
          </View>
        </View>

        {/* ---- PROJECT NOTES ---- */}
        <View style={styles.notesSection}>
          {TKBSO_NOTES.map((note, idx) => (
            <View key={idx} style={styles.noteItem} wrap={false}>
              <Text style={styles.noteText}>
                <Text style={styles.noteLabel}>{note.label}</Text>
                {' '}{note.text}
              </Text>
            </View>
          ))}
          {customNoteText ? (
            <View style={styles.noteItem} wrap={false}>
              <Text style={styles.noteText}>
                <Text style={styles.noteLabel}>Note V:</Text>
                {' '}{customNoteText}
              </Text>
            </View>
          ) : null}
        </View>

        {/* ---- FOOTER ---- */}
        <View style={styles.pageFooter} fixed>
          <Text style={styles.footerText}>
            The Kitchen and Bath Store of Orlando
          </Text>
        </View>
      </Page>
    </Document>
  );
}
