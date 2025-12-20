import {
  Document,
  Paragraph,
  TextRun,
  Packer,
  ImageRun,
  convertInchesToTwip,
  AlignmentType,
  BorderStyle,
} from 'docx';
import { saveAs } from 'file-saver';
import { Contractor, Estimate } from '@/types/database';
import { ContractorSettings, defaultSettings } from '@/types/settings';
import tkbsoLogo from '@/assets/tkbso-logo-full.png';

// Passthrough line item interface (matches PDF)
export interface PassthroughLineItem {
  name: string;
  quantity: number;
  unit: string;
  cost: number;
  price: number;
  room_label?: string;
}

// Additional item interface
interface Additional {
  id: string;
  description: string;
  details?: string;
  price: number;
  category?: string;
}

interface ProposalWordProps {
  contractor: Contractor;
  estimate: Estimate;
  lineItems: PassthroughLineItem[];
  total: number;
}

const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Helper to fetch image as ArrayBuffer
async function fetchImageAsArrayBuffer(url: string): Promise<ArrayBuffer | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.arrayBuffer();
  } catch (error) {
    console.error('Failed to fetch image:', error);
    return null;
  }
}

// Group line items by room_label
// For single-bathroom projects, all items go under one bathroom section
function groupLineItemsByRoom(
  lineItems: PassthroughLineItem[],
  estimate: Estimate
): Map<string, PassthroughLineItem[]> {
  const groups = new Map<string, PassthroughLineItem[]>();
  
  // Count unique room labels (excluding empty/null)
  const uniqueRooms = new Set(
    lineItems.filter(item => item.room_label && item.room_label.trim()).map(item => item.room_label!)
  );
  
  // Determine if this is a single-bathroom project
  const bathroomCount = estimate.num_bathrooms || 1;
  const isSingleBathroom = bathroomCount === 1 && uniqueRooms.size <= 1;
  
  if (isSingleBathroom) {
    // For single-bathroom projects, ALL items go under one section
    const bathroomLabel = uniqueRooms.size === 1 
      ? Array.from(uniqueRooms)[0] 
      : 'Bathroom 1';
    groups.set(bathroomLabel, lineItems);
    return groups;
  }
  
  // For multi-bathroom projects, group by room_label
  for (const item of lineItems) {
    const roomLabel = item.room_label || '_general';
    if (!groups.has(roomLabel)) {
      groups.set(roomLabel, []);
    }
    groups.get(roomLabel)!.push(item);
  }
  
  return groups;
}

// Calculate subtotal for a room
function calculateSubtotal(items: PassthroughLineItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Parse dimensions from room label (e.g., "Guest Bath 1 (31"x59")" -> {width: 31, length: 59})
function parseDimensionsFromLabel(label: string): { width: number; length: number } | null {
  const match = label.match(/\((\d+)"?\s*x\s*(\d+)"?\)/i);
  if (match) {
    return {
      width: parseInt(match[1], 10),
      length: parseInt(match[2], 10),
    };
  }
  return null;
}

// Calculate wall tile square footage (with 12% waste factor)
function calculateWallTileSqft(dims: { width: number; length: number }, ceilingHeight: number = 96): number {
  const widthFt = dims.width / 12;
  const lengthFt = dims.length / 12;
  const heightFt = ceilingHeight / 12;
  
  const backWall = lengthFt * heightFt;
  const sideWall1 = widthFt * heightFt;
  const sideWall2 = widthFt * heightFt;
  
  // Total with 12% waste factor (includes cuts, waste, overage)
  const totalWallSqft = (backWall + sideWall1 + sideWall2) * 1.12;
  
  return Math.round(totalWallSqft);
}

// Calculate shower floor square footage (with 18% waste for mosaic tile)
function calculateShowerFloorSqft(dims: { width: number; length: number }): number {
  const widthFt = dims.width / 12;
  const lengthFt = dims.length / 12;
  
  // 18% waste factor for mosaic/smaller shower floor tile
  const floorSqft = (widthFt * lengthFt) * 1.18;
  
  return Math.round(floorSqft);
}

// Check if item is tile-related
function isTileLineItem(itemName: string): boolean {
  const name = itemName.toLowerCase();
  return name.includes('tile') || name.includes('waterproof') || 
         name.includes('shower wall') || name.includes('shower floor');
}

// Get additionals from estimate
function getAdditionals(estimate: Estimate): Additional[] {
  const payload = estimate.internal_json_payload as any;
  if (payload?.additionals && Array.isArray(payload.additionals)) {
    return payload.additionals;
  }
  return [];
}

// Calculate market price
function calculateMarketPrice(customerPrice: number, multiplier: number = 1.23): number {
  return Math.round(customerPrice * multiplier);
}

// Determine progress milestone based on scope
function determineProgressMilestone(lineItems: PassthroughLineItem[], estimate: Estimate): { description: string; details: string } {
  const itemNames = lineItems.map(item => item.name.toLowerCase()).join(' ');
  
  const hasTileWork = itemNames.includes('tile') || itemNames.includes('waterproof');
  const hasVanityWork = itemNames.includes('vanity') || itemNames.includes('cabinet');
  const hasPlumbingWork = itemNames.includes('plumb');
  const hasFramingWork = itemNames.includes('fram') || itemNames.includes('drywall');
  const hasCountertopWork = itemNames.includes('countertop') || itemNames.includes('quartz');
  
  if (hasTileWork) {
    return {
      description: 'Due upon tile installation',
      details: 'Rough plumbing and framing substantially complete',
    };
  }
  
  if (hasVanityWork) {
    return {
      description: 'Due upon vanity/cabinet installation',
      details: 'Tile work and plumbing rough-in complete',
    };
  }
  
  if (hasPlumbingWork) {
    return {
      description: 'Due upon rough plumbing completion',
      details: 'Demolition and framing complete',
    };
  }
  
  if (hasCountertopWork) {
    return {
      description: 'Due upon countertop installation',
      details: 'Cabinets installed and plumbing rough-in complete',
    };
  }
  
  if (hasFramingWork) {
    return {
      description: 'Due upon drywall completion',
      details: 'Framing and rough utilities complete',
    };
  }
  
  return {
    description: 'Due at project midpoint',
    details: 'Approximately 50% of work complete',
  };
}

export async function generateProposalWord({
  contractor,
  estimate,
  lineItems,
  total,
}: ProposalWordProps): Promise<void> {
  const settings: ContractorSettings = (contractor.settings as ContractorSettings) || defaultSettings;
  const { companyProfile, branding, defaults } = settings;

  // Check if dual pricing should be shown
  const showDualPricing = defaults.showMarketComparison ?? true;
  const marketPriceMultiplier = 1.23;

  // Payment splits
  const depositSplit = (defaults.depositPct || 65) / 100;
  const progressSplit = (defaults.progressPct || 25) / 100;
  const finalSplit = (defaults.finalPct || 10) / 100;

  const depositAmount = Math.round(total * depositSplit);
  const progressAmount = Math.round(total * progressSplit);
  const finalAmount = Math.round(total * finalSplit);

  // Dynamic milestone
  const progressMilestone = determineProgressMilestone(lineItems, estimate);

  const addressParts = [estimate.property_address, estimate.city, estimate.state, estimate.zip].filter(Boolean);
  const fullAddress = addressParts.join(', ').replace(/,\s*,/g, ',');

  const clientName = estimate.client_name || 'Valued Customer';
  const companyName = companyProfile.companyName || branding.headerTitle || contractor.name;
  const companyPhone = companyProfile.phone || contractor.primary_contact_phone || '';
  const companyEmail = companyProfile.email || contractor.primary_contact_email || '';

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Group items by room
  const groupedItems = groupLineItemsByRoom(lineItems, estimate);
  const roomEntries = Array.from(groupedItems.entries());
  
  // Calculate base total and scale factor
  const baseTotal = lineItems.reduce((sum, item) => sum + item.price, 0);
  const scaleFactor = baseTotal > 0 ? total / baseTotal : 1;
  
  // Calculate room subtotals
  const roomSubtotals = roomEntries.map(([label, items]) => ({
    label: label === '_general' ? 'General Items' : label,
    subtotal: Math.round(calculateSubtotal(items) * scaleFactor),
  }));

  // Get additionals
  const additionals = getAdditionals(estimate);
  const additionalsTotal = additionals.reduce((sum, a) => sum + a.price, 0);

  // Market price calculations
  const marketPrice = calculateMarketPrice(total, marketPriceMultiplier);
  const savings = marketPrice - total;
  const savingsPercent = Math.round((savings / marketPrice) * 100);

  // Fetch logo image
  const logoUrl = contractor.logo_url || tkbsoLogo;
  const logoData = await fetchImageAsArrayBuffer(logoUrl);

  // Build document
  const children: Paragraph[] = [];

  // Logo header
  if (logoData) {
    children.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: logoData,
            transformation: { width: 200, height: 60 },
            type: 'png',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 150 },
      })
    );
  } else {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: companyName, bold: true, size: 36, color: '1e3a8a' }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      })
    );
  }

  // Contact info
  if (companyPhone || companyEmail) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: [companyPhone, companyEmail].filter(Boolean).join('  •  '),
            size: 18,
            color: '1e3a8a',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );
  }

  // Divider
  children.push(
    new Paragraph({
      children: [new TextRun({ text: '─'.repeat(80), color: 'e2e8f0', size: 16 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    })
  );

  // Quote title
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: `Quote for ${clientName}`, bold: true, size: 32, color: '1e3a8a' }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 50 },
    })
  );

  // Date
  children.push(
    new Paragraph({
      children: [new TextRun({ text: currentDate, size: 18, color: '64748b' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Client info
  if (estimate.client_phone) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Phone: ', bold: true, size: 20, color: '64748b' }),
          new TextRun({ text: estimate.client_phone, size: 20, color: '1e293b' }),
        ],
        spacing: { after: 50 },
      })
    );
  }

  if (estimate.client_email) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Email: ', bold: true, size: 20, color: '64748b' }),
          new TextRun({ text: estimate.client_email, size: 20, color: '1e293b' }),
        ],
        spacing: { after: 50 },
      })
    );
  }

  if (fullAddress) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Property: ', bold: true, size: 20, color: '64748b' }),
          new TextRun({ text: fullAddress, size: 20, color: '1e293b' }),
        ],
        spacing: { after: 200 },
      })
    );
  }

  // Divider
  children.push(
    new Paragraph({
      children: [new TextRun({ text: '─'.repeat(80), color: 'e2e8f0', size: 16 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 300, before: 100 },
    })
  );

  // Room sections
  for (const [roomLabel, roomItems] of roomEntries) {
    const displayLabel = roomLabel === '_general' ? 'General Items' : roomLabel;
    const subtotal = Math.round(calculateSubtotal(roomItems) * scaleFactor);
    
    // Check for tile work and dimensions
    const hasTile = roomItems.some(item => isTileLineItem(item.name));
    const dims = parseDimensionsFromLabel(roomLabel);
    const wallTileSqft = dims && hasTile ? calculateWallTileSqft(dims) : null;
    const showerFloorSqft = dims && hasTile ? calculateShowerFloorSqft(dims) : null;
    
    // Room header
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: displayLabel, bold: true, size: 22, color: 'ffffff' }),
        ],
        shading: { fill: '0ea5e9' },
        spacing: { before: 200, after: 100 },
      })
    );

    // Scope Details label
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Scope Details', bold: true, size: 18, color: '64748b' }),
        ],
        spacing: { after: 50 },
      })
    );

    // Process items - consolidate tile items with inline sqft
    let hasAddedTileDescription = false;
    
    for (const item of roomItems) {
      const itemIsTile = isTileLineItem(item.name);
      
      // For tile items, create consolidated description with inline sqft
      if (itemIsTile && hasTile && wallTileSqft && !hasAddedTileDescription) {
        const bathroomName = displayLabel.replace(/\s*\([^)]*\)\s*$/, '').trim();
        const consolidatedTileDesc = `${bathroomName}: Large format porcelain(24"x48" or 36"x36") shower wall tile to 96" ceiling (${wallTileSqft} sqft), mosaic shower floor tile (${showerFloorSqft} sqft), + waterproofing and 1 niche`;
        
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `• ${consolidatedTileDesc}`, size: 18, color: '475569' }),
            ],
            indent: { left: convertInchesToTwip(0.2) },
            spacing: { after: 50 },
          })
        );
        hasAddedTileDescription = true;
      } else if (itemIsTile && hasAddedTileDescription) {
        // Skip additional tile line items since we consolidated
        continue;
      } else {
        // Non-tile items pass through normally
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `• ${item.name}`, size: 18, color: '475569' }),
            ],
            indent: { left: convertInchesToTwip(0.2) },
            spacing: { after: 50 },
          })
        );
      }
    }

    // Dual pricing for room (if enabled)
    if (showDualPricing) {
      const roomMarketPrice = calculateMarketPrice(subtotal, marketPriceMultiplier);
      const roomSavings = roomMarketPrice - subtotal;
      
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `Market: ${formatCurrency(roomMarketPrice)}`, size: 18, color: '94a3b8', strike: true }),
            new TextRun({ text: `  Save ${formatCurrency(roomSavings)}`, size: 16, color: '10b981' }),
          ],
          alignment: AlignmentType.RIGHT,
          spacing: { after: 50 },
        })
      );
    }

    // Room subtotal
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${displayLabel} Subtotal: `, size: 20, color: '475569' }),
          new TextRun({ text: formatCurrency(subtotal), bold: true, size: 22, color: '1e293b' }),
        ],
        alignment: AlignmentType.RIGHT,
        border: { top: { style: BorderStyle.SINGLE, size: 6, color: 'e2e8f0' } },
        spacing: { before: 50, after: 150 },
      })
    );
  }

  // Additionals section (if any)
  if (additionals.length > 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: '─'.repeat(80), color: 'e2e8f0', size: 16 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200, before: 200 },
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'RECOMMENDED ADDITIONALS (Optional)', bold: true, size: 20, color: 'ea580c' }),
        ],
        spacing: { after: 100 },
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Add these upgrades to enhance your project:', size: 16, color: '64748b' }),
        ],
        spacing: { after: 100 },
      })
    );

    for (const additional of additionals) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `☐ ${additional.description}`, bold: true, size: 18, color: '1e293b' }),
            new TextRun({ text: `  ${formatCurrency(additional.price)}`, size: 18, color: '475569' }),
          ],
          spacing: { after: 30 },
        })
      );
      
      if (additional.details) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `    ${additional.details}`, size: 16, color: '64748b', italics: true }),
            ],
            spacing: { after: 80 },
          })
        );
      }
    }

    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `Total if all additionals selected: ${formatCurrency(additionalsTotal)}`, bold: true, size: 18, color: 'ea580c' }),
        ],
        alignment: AlignmentType.RIGHT,
        spacing: { before: 100, after: 200 },
      })
    );
  }

  // Project Total section
  children.push(
    new Paragraph({
      children: [new TextRun({ text: '─'.repeat(80), color: '1e3a8a', size: 16 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100, before: 200 },
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'PROJECT TOTAL', bold: true, size: 20, color: '64748b' }),
      ],
      spacing: { after: 100 },
    })
  );

  // Room subtotals summary
  for (const room of roomSubtotals) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: room.label, size: 18, color: '475569' }),
          new TextRun({ text: `  ${formatCurrency(room.subtotal)}`, size: 18, color: '1e293b' }),
        ],
        spacing: { after: 30 },
      })
    );
  }

  children.push(
    new Paragraph({
      children: [new TextRun({ text: '─'.repeat(40), color: 'e2e8f0', size: 16 })],
      spacing: { after: 100, before: 50 },
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'TOTAL PROJECT INVESTMENT: ', bold: true, size: 24, color: '1e3a8a' }),
        new TextRun({ text: formatCurrency(total), bold: true, size: 28, color: '1e3a8a' }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    })
  );

  // Market comparison for total (if enabled)
  if (showDualPricing) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `Market Value: ${formatCurrency(marketPrice)}`, size: 18, color: '94a3b8' }),
          new TextRun({ text: `  |  You Save: ${formatCurrency(savings)} (${savingsPercent}%)`, size: 18, color: '10b981' }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
      })
    );
  }

  // Payment Schedule
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'PAYMENT SCHEDULE', bold: true, size: 20, color: '1e3a8a' }),
      ],
      spacing: { before: 200, after: 150 },
    })
  );

  // Deposit
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: `${Math.round(depositSplit * 100)}%  `, bold: true, size: 20, color: '1e3a8a' }),
        new TextRun({ text: 'Deposit – Due upon contract signing', size: 20, color: '475569' }),
        new TextRun({ text: `    ${formatCurrency(depositAmount)}`, bold: true, size: 20, color: '1e293b' }),
      ],
      spacing: { after: 30 },
    })
  );
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: '     Includes mobilization, materials ordering, and scheduling', size: 16, color: '64748b', italics: true }),
      ],
      spacing: { after: 80 },
    })
  );

  // Progress (dynamic milestone)
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: `${Math.round(progressSplit * 100)}%  `, bold: true, size: 20, color: '1e3a8a' }),
        new TextRun({ text: `Progress – ${progressMilestone.description}`, size: 20, color: '475569' }),
        new TextRun({ text: `    ${formatCurrency(progressAmount)}`, bold: true, size: 20, color: '1e293b' }),
      ],
      spacing: { after: 30 },
    })
  );
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: `     ${progressMilestone.details}`, size: 16, color: '64748b', italics: true }),
      ],
      spacing: { after: 80 },
    })
  );

  // Final
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: `${Math.round(finalSplit * 100)}%  `, bold: true, size: 20, color: '1e3a8a' }),
        new TextRun({ text: 'Final – Due at project completion', size: 20, color: '475569' }),
        new TextRun({ text: `    ${formatCurrency(finalAmount)}`, bold: true, size: 20, color: '1e293b' }),
      ],
      spacing: { after: 30 },
    })
  );
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: '     Final walkthrough and punchlist complete', size: 16, color: '64748b', italics: true }),
      ],
      spacing: { after: 200 },
    })
  );

  // Acceptance section
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'ACCEPTANCE', bold: true, size: 20, color: '1e3a8a' }),
      ],
      spacing: { before: 300, after: 100 },
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'By signing below, I accept this quote and agree to the terms, scope of work, and payment schedule outlined above.',
          size: 18,
          color: '475569',
        }),
      ],
      spacing: { after: 300 },
    })
  );

  // Signature lines
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'Client Signature: ', size: 20, color: '475569' }),
        new TextRun({ text: '_'.repeat(40), size: 20, color: '94a3b8' }),
        new TextRun({ text: '    Date: ', size: 20, color: '475569' }),
        new TextRun({ text: '_'.repeat(20), size: 20, color: '94a3b8' }),
      ],
      spacing: { after: 150 },
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'Print Name: ', size: 20, color: '475569' }),
        new TextRun({ text: '_'.repeat(40), size: 20, color: '94a3b8' }),
      ],
      spacing: { after: 200 },
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: `${companyName}: `, size: 20, color: '475569' }),
        new TextRun({ text: '_'.repeat(40), size: 20, color: '94a3b8' }),
        new TextRun({ text: '    Date: ', size: 20, color: '475569' }),
        new TextRun({ text: '_'.repeat(20), size: 20, color: '94a3b8' }),
      ],
      spacing: { after: 400 },
    })
  );

  // Notes section
  const notes = estimate.job_notes || defaults.termsText || '';
  if (notes) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'PROJECT NOTES', bold: true, size: 18, color: '1e3a8a' }),
        ],
        spacing: { before: 200, after: 100 },
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: notes, size: 16, color: '64748b' }),
        ],
        spacing: { after: 200 },
      })
    );
  }

  // Footer
  children.push(
    new Paragraph({
      children: [new TextRun({ text: '─'.repeat(80), color: 'e2e8f0', size: 16 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 100 },
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: `© ${new Date().getFullYear()} ${companyName}`, size: 16, color: '94a3b8' }),
      ],
      alignment: AlignmentType.CENTER,
    })
  );

  if (companyPhone || companyEmail) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: [companyPhone, companyEmail].filter(Boolean).join(' | '),
            size: 16,
            color: '94a3b8',
          }),
        ],
        alignment: AlignmentType.CENTER,
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.75),
              right: convertInchesToTwip(0.75),
              bottom: convertInchesToTwip(0.75),
              left: convertInchesToTwip(0.75),
            },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  
  const clientFileName = estimate.client_name?.replace(/[^a-zA-Z0-9]/g, '_') || '';
  const jobLabel = estimate.job_label?.replace(/[^a-zA-Z0-9]/g, '_') || '';
  const filename = clientFileName || jobLabel
    ? `Proposal_${clientFileName}${jobLabel ? '_' + jobLabel : ''}.docx`
    : `Proposal_${estimate.id}.docx`;

  saveAs(blob, filename);
}
