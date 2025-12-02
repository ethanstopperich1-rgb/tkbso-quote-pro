import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2, Eye } from 'lucide-react';
import { ProposalPdfDocument, ProposalPdfProps, ScopeItem } from './ProposalPdfDocument';
import { toast } from 'sonner';

interface ProposalPdfGeneratorProps {
  proposalData: Omit<ProposalPdfProps, 'date'>;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export function ProposalPdfGenerator({ 
  proposalData, 
  variant = 'default',
  size = 'default' 
}: ProposalPdfGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const generatePdf = async (preview: boolean = false) => {
    if (preview) {
      setIsPreviewing(true);
    } else {
      setIsGenerating(true);
    }

    try {
      const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const blob = await pdf(
        <ProposalPdfDocument {...proposalData} date={date} />
      ).toBlob();

      const url = URL.createObjectURL(blob);

      if (preview) {
        // Open in new tab for preview
        window.open(url, '_blank');
      } else {
        // Download
        const link = document.createElement('a');
        link.href = url;
        link.download = `${proposalData.clientName || 'Quote'}_${proposalData.projectType}_Proposal.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('PDF downloaded successfully!');
      }

      // Cleanup URL after a delay
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
      setIsPreviewing(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size={size}
        onClick={() => generatePdf(true)}
        disabled={isPreviewing || isGenerating}
      >
        {isPreviewing ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Eye className="w-4 h-4 mr-2" />
        )}
        Preview
      </Button>
      <Button
        variant={variant}
        size={size}
        onClick={() => generatePdf(false)}
        disabled={isGenerating || isPreviewing}
      >
        {isGenerating ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <FileDown className="w-4 h-4 mr-2" />
        )}
        Download PDF
      </Button>
    </div>
  );
}

// Helper function to convert context/estimate data to PDF props
export function buildProposalData(
  clientName: string,
  address: string,
  projectType: string,
  totalPrice: number,
  scopeText: string,
  options?: {
    city?: string;
    state?: string;
    zip?: string;
    lowPrice?: number;
    highPrice?: number;
    estimatedDays?: number;
    paymentSplit?: { deposit: number; progress: number; final: number };
  }
): Omit<ProposalPdfProps, 'date'> {
  // Generate summary bullets from project type and price
  const summaryBullets = generateSummaryBullets(projectType, totalPrice, scopeText);
  
  // Parse scope text into structured items
  const scopeItems = parseScopeText(scopeText);

  return {
    clientName,
    address,
    city: options?.city,
    state: options?.state,
    zip: options?.zip,
    projectType: capitalizeFirst(projectType),
    summaryBullets,
    totalPrice,
    lowPrice: options?.lowPrice,
    highPrice: options?.highPrice,
    scopeItems,
    paymentMilestones: options?.paymentSplit || {
      deposit: 0.65,
      progress: 0.25,
      final: 0.10,
    },
    estimatedDays: options?.estimatedDays || 14,
  };
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function generateSummaryBullets(projectType: string, totalPrice: number, scopeText: string): string[] {
  const bullets: string[] = [];
  const lowerScope = scopeText.toLowerCase();
  
  // Determine scope intensity
  if (lowerScope.includes('full gut') || lowerScope.includes('demo')) {
    bullets.push(`Full ${capitalizeFirst(projectType)} Gut Renovation`);
  } else if (lowerScope.includes('partial')) {
    bullets.push(`Partial ${capitalizeFirst(projectType)} Remodel`);
  } else {
    bullets.push(`${capitalizeFirst(projectType)} Refresh and Update`);
  }

  // Add key features based on scope
  if (lowerScope.includes('tile')) {
    bullets.push('Custom tile installation throughout wet areas');
  }
  if (lowerScope.includes('glass') || lowerScope.includes('frameless')) {
    bullets.push('Frameless glass shower enclosure');
  }
  if (lowerScope.includes('vanity')) {
    const vanityMatch = scopeText.match(/(\d+)["\s]*(?:inch|in|")?\s*vanity/i);
    if (vanityMatch) {
      bullets.push(`${vanityMatch[1]}-inch vanity with countertop`);
    } else {
      bullets.push('New vanity with countertop installation');
    }
  }
  if (lowerScope.includes('plumbing')) {
    bullets.push('Complete plumbing rough-in and fixtures');
  }
  if (lowerScope.includes('electrical') || lowerScope.includes('lighting')) {
    bullets.push('Electrical upgrades and new lighting');
  }
  if (lowerScope.includes('cabinet')) {
    bullets.push('New cabinetry installation');
  }
  if (lowerScope.includes('countertop') || lowerScope.includes('quartz')) {
    bullets.push('Quartz countertop fabrication and installation');
  }
  if (lowerScope.includes('paint')) {
    bullets.push('Professional painting and finishing');
  }

  // Ensure we have at least 3 bullets
  if (bullets.length < 3) {
    bullets.push('Professional installation by licensed contractors');
  }
  if (bullets.length < 3) {
    bullets.push('Quality materials and craftsmanship guaranteed');
  }

  return bullets.slice(0, 5); // Max 5 bullets
}

function parseScopeText(scopeText: string): ScopeItem[] {
  const items: ScopeItem[] = [];
  const sections = scopeText.split('\n\n');

  // Define category mappings
  const categoryMap: Record<string, string> = {
    'demo': 'Demolition',
    'demolition': 'Demolition',
    'framing': 'Framing',
    'plumbing': 'Plumbing',
    'electrical': 'Electrical',
    'tile': 'Tile Work',
    'tile work': 'Tile Work',
    'vanity': 'Vanity',
    'glass': 'Shower Glass',
    'shower glass': 'Shower Glass',
    'paint': 'Painting',
    'painting': 'Painting',
    'cabinet': 'Cabinetry',
    'cabinetry': 'Cabinetry',
    'countertop': 'Countertops',
    'quartz': 'Countertops',
  };

  let currentCategory = '';
  
  for (const section of sections) {
    const lines = section.split('\n').filter(l => l.trim());
    
    for (const line of lines) {
      const cleanLine = line.trim();
      
      // Check if this is a category header
      const headerMatch = cleanLine.match(/^([A-Z\s]+):?$/);
      if (headerMatch) {
        const headerLower = headerMatch[1].toLowerCase().trim();
        currentCategory = categoryMap[headerLower] || headerMatch[1].trim();
        continue;
      }

      // Check if line is a bullet point
      if (cleanLine.startsWith('•') || cleanLine.startsWith('-') || cleanLine.startsWith('*')) {
        const task = cleanLine.replace(/^[•\-*]\s*/, '').trim();
        if (task && currentCategory) {
          items.push({
            category: currentCategory,
            task,
            included: true,
          });
        }
      }
    }
  }

  // If no items parsed, create default structure
  if (items.length === 0) {
    const defaultCategories = ['Demolition', 'Plumbing', 'Tile Work', 'Painting'];
    for (const category of defaultCategories) {
      items.push({
        category,
        task: `${category} work as specified in project scope`,
        included: true,
      });
    }
  }

  return items;
}
