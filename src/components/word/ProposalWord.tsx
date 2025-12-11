import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  Packer,
  ImageRun,
  convertInchesToTwip,
  ITableCellBorders,
} from 'docx';
import { saveAs } from 'file-saver';
import { Contractor, Estimate, PricingConfig } from '@/types/database';
import { ContractorSettings, defaultSettings } from '@/types/settings';
import { formatLineItemForPdf } from '@/lib/line-item-descriptions';

// Import the buildTradeGroups function logic - we'll replicate key parts
interface TradeGroup {
  trade: string;
  items: Array<{
    description: string;
    quantity?: number;
    unit?: string;
    isMaterialAllowance?: boolean;
  }>;
}

interface ProposalWordProps {
  contractor: Contractor;
  estimate: Estimate;
  pricingConfig?: PricingConfig;
  priceRange?: {
    low: number;
    high: number;
  };
  showTileSqft?: boolean;
  tradeGroups: TradeGroup[];
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

const noBorders: ITableCellBorders = {
  top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
};

export async function generateProposalWord({
  contractor,
  estimate,
  pricingConfig,
  priceRange,
  tradeGroups,
}: ProposalWordProps): Promise<void> {
  const settings: ContractorSettings = (contractor.settings as ContractorSettings) || defaultSettings;
  const { companyProfile, branding, defaults } = settings;

  const depositSplit = (defaults.depositPct || pricingConfig?.payment_split_deposit || 65) / 100;
  const progressSplit = (defaults.progressPct || pricingConfig?.payment_split_progress || 25) / 100;
  const finalSplit = (defaults.finalPct || pricingConfig?.payment_split_final || 10) / 100;

  const isKitchenProject = estimate.has_kitchen && !estimate.has_bathrooms;
  const progressLabel = isKitchenProject
    ? (defaults.progressLabelKitchen || 'Due at arrival of cabinetry')
    : (defaults.progressLabelBathroom || 'Due at start of tile installation');

  const showRange = priceRange && priceRange.low > 0 && priceRange.high > 0;
  const totalCost = estimate.final_cp_total || 0;
  
  const baseAmount = showRange ? Math.round((priceRange.low + priceRange.high) / 2) : totalCost;
  const depositAmount = Math.round(baseAmount * depositSplit);
  const progressAmount = Math.round(baseAmount * progressSplit);
  const finalAmount = Math.round(baseAmount * finalSplit);

  const depositAmountLow = showRange ? Math.round(priceRange.low * depositSplit) : depositAmount;
  const depositAmountHigh = showRange ? Math.round(priceRange.high * depositSplit) : depositAmount;
  const progressAmountLow = showRange ? Math.round(priceRange.low * progressSplit) : progressAmount;
  const progressAmountHigh = showRange ? Math.round(priceRange.high * progressSplit) : progressAmount;
  const finalAmountLow = showRange ? Math.round(priceRange.low * finalSplit) : finalAmount;
  const finalAmountHigh = showRange ? Math.round(priceRange.high * finalSplit) : finalAmount;

  const addressParts = [estimate.property_address, estimate.city, estimate.state, estimate.zip].filter(Boolean);
  const fullAddress = addressParts.join(', ').replace(/,\s*,/g, ',');

  const clientName = estimate.client_name || 'Valued Customer';
  const companyName = companyProfile.companyName || branding.headerTitle || 'The Kitchen & Bath Store of Orlando';
  const companyPhone = companyProfile.phone || '';
  const companyEmail = companyProfile.email || '';

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const notes = estimate.job_notes || defaults.termsText || 'This estimate is valid for 30 days. Final pricing subject to site conditions and material selections. Permits, if required, are excluded unless noted otherwise.';

  // Build document sections
  const children: Paragraph[] = [];

  // Header with company name
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: companyName,
          bold: true,
          size: 36, // 18pt
          color: '1e3a8a',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    })
  );

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

  // Divider line
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '─'.repeat(80),
          color: 'e2e8f0',
          size: 16,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    })
  );

  // Quote title
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Quote for ${clientName}`,
          bold: true,
          size: 32, // 16pt
          color: '1e3a8a',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 50 },
    })
  );

  // Date
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: currentDate,
          size: 18,
          color: '64748b',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Client info section
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
      children: [
        new TextRun({
          text: '─'.repeat(80),
          color: 'e2e8f0',
          size: 16,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 300, before: 100 },
    })
  );

  // Trade groups
  for (const group of tradeGroups) {
    // Trade header
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: group.trade,
            bold: true,
            size: 22,
            color: '1e3a8a',
          }),
        ],
        border: {
          bottom: {
            color: '1e3a8a',
            size: 6,
            style: BorderStyle.SINGLE,
            space: 1,
          },
        },
        spacing: { before: 200, after: 100 },
      })
    );

    // Trade items
    for (const item of group.items) {
      const description = item.isMaterialAllowance
        ? item.description
        : formatLineItemForPdf(item.description, item.quantity, item.unit);

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `• ${description}`,
              size: 18,
              color: item.isMaterialAllowance ? '64748b' : '475569',
              italics: item.isMaterialAllowance,
            }),
          ],
          indent: { left: convertInchesToTwip(0.2) },
          spacing: { after: 50 },
        })
      );
    }
  }

  // Spacing before totals
  children.push(
    new Paragraph({
      children: [],
      spacing: { after: 200 },
    })
  );

  // Subtotal + Management Fee if applicable
  if (estimate.include_management_fee && (estimate.management_fee_cp || 0) > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '─'.repeat(80),
            color: 'e2e8f0',
            size: 16,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Subtotal: ', size: 20, color: '475569' }),
          new TextRun({ text: formatCurrency(totalCost - (estimate.management_fee_cp || 0)), bold: true, size: 20, color: '1e293b' }),
        ],
        alignment: AlignmentType.RIGHT,
        spacing: { after: 50 },
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `Project Management Fee (${((estimate.management_fee_percent || 0) * 100).toFixed(0)}%): `, size: 20, color: '475569' }),
          new TextRun({ text: formatCurrency(estimate.management_fee_cp), bold: true, size: 20, color: '1e293b' }),
        ],
        alignment: AlignmentType.RIGHT,
        spacing: { after: 100 },
      })
    );
  }

  // Total Investment
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '─'.repeat(80),
          color: '1e3a8a',
          size: 16,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100, before: 100 },
    })
  );

  const totalText = showRange
    ? `${formatCurrency(priceRange.low)} to ${formatCurrency(priceRange.high)}`
    : formatCurrency(totalCost);

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'Total Investment: ', bold: true, size: 28, color: '1e3a8a' }),
        new TextRun({ text: totalText, bold: true, size: 28, color: '1e3a8a' }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Payment Schedule section
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Payment Schedule',
          bold: true,
          size: 24,
          color: '1e3a8a',
        }),
      ],
      spacing: { before: 300, after: 150 },
    })
  );

  // Payment rows
  const paymentRows = [
    {
      percent: Math.round(depositSplit * 100),
      label: 'Deposit – Due upon signing',
      amount: showRange
        ? `${formatCurrency(depositAmountLow)} to ${formatCurrency(depositAmountHigh)}`
        : formatCurrency(depositAmount),
    },
    {
      percent: Math.round(progressSplit * 100),
      label: `Progress – ${progressLabel}`,
      amount: showRange
        ? `${formatCurrency(progressAmountLow)} to ${formatCurrency(progressAmountHigh)}`
        : formatCurrency(progressAmount),
    },
    {
      percent: Math.round(finalSplit * 100),
      label: 'Final – Due at completion',
      amount: showRange
        ? `${formatCurrency(finalAmountLow)} to ${formatCurrency(finalAmountHigh)}`
        : formatCurrency(finalAmount),
    },
  ];

  for (const row of paymentRows) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${row.percent}%  `, bold: true, size: 20, color: '1e3a8a' }),
          new TextRun({ text: row.label, size: 20, color: '475569' }),
          new TextRun({ text: `    ${row.amount}`, bold: true, size: 20, color: '1e293b' }),
        ],
        spacing: { after: 80 },
      })
    );
  }

  // Acceptance section
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Acceptance',
          bold: true,
          size: 24,
          color: '1e3a8a',
        }),
      ],
      spacing: { before: 400, after: 100 },
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'By signing below, I accept this quote and agree to the terms and payment schedule.',
          size: 18,
          color: '475569',
        }),
      ],
      spacing: { after: 300 },
    })
  );

  // Signature line
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
      spacing: { after: 400 },
    })
  );

  // Notes section
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Notes',
          bold: true,
          size: 20,
          color: '64748b',
        }),
      ],
      spacing: { before: 200, after: 50 },
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: notes,
          size: 16,
          color: '64748b',
          italics: true,
        }),
      ],
      spacing: { after: 200 },
    })
  );

  // Footer
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '─'.repeat(80),
          color: 'e2e8f0',
          size: 16,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 100 },
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: companyName,
          size: 16,
          color: '94a3b8',
        }),
      ],
      alignment: AlignmentType.CENTER,
    })
  );

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
