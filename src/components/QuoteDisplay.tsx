import { Quote } from "@/types/estimator";
import { formatCurrency, formatPercentage } from "@/lib/pricing";
import { Copy, Check, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { QuotePDFGenerator } from "./QuotePDFGenerator";

interface QuoteDisplayProps {
  quote: Quote;
}

export function QuoteDisplay({ quote }: QuoteDisplayProps) {
  const [showInternal, setShowInternal] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyClientFacingQuote = () => {
    const clientQuote = generateClientFacingText(quote);
    navigator.clipboard.writeText(clientQuote);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "Client-facing quote has been copied.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-primary px-4 py-3 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-primary-foreground">
          Project Quote
        </h3>
        <div className="flex items-center gap-2">
          <QuotePDFGenerator quote={quote} />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowInternal(!showInternal)}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            {showInternal ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
            {showInternal ? "Hide Internal" : "Show Internal"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyClientFacingQuote}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
            Copy Quote
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Section 1: Project Snapshot */}
        <section className="quote-section quote-section-client">
          <div className="flex items-center gap-2 mb-3">
            <span className="section-badge section-badge-client">Client-Facing</span>
            <h4 className="font-display font-semibold">Project Snapshot</h4>
          </div>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Project</dt>
              <dd className="font-medium">{quote.projectSnapshot.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Location</dt>
              <dd className="font-medium">{quote.projectSnapshot.location}</dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-muted-foreground">Rooms</dt>
              <dd className="font-medium">{quote.projectSnapshot.roomsSummary}</dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-muted-foreground">Scope</dt>
              <dd className="font-medium">{quote.projectSnapshot.scopeSummary}</dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-muted-foreground">Permit/GC</dt>
              <dd className="font-medium">{quote.projectSnapshot.permitGCSummary}</dd>
            </div>
          </dl>
        </section>

        {/* Section 2: Price Summary */}
        <section className="quote-section quote-section-client">
          <div className="flex items-center gap-2 mb-3">
            <span className="section-badge section-badge-client">Client-Facing</span>
            <h4 className="font-display font-semibold">Investment Summary</h4>
          </div>
          <div className="bg-secondary/50 rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-1">Estimated Investment Range</div>
            <div className="text-lg font-semibold mb-3">
              {formatCurrency(quote.priceSummary.lowEstimate)} – {formatCurrency(quote.priceSummary.highEstimate)}
            </div>
            <div className="border-t pt-3">
              <div className="text-sm text-muted-foreground mb-1">Recommended TKBSO Quote</div>
              <div className="text-2xl font-display font-bold text-primary">
                {formatCurrency(quote.priceSummary.recommendedPrice)}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">{quote.priceSummary.perSqftNote}</p>
          </div>
        </section>

        {/* Section 3: Scope of Work */}
        <section className="quote-section quote-section-client">
          <div className="flex items-center gap-2 mb-3">
            <span className="section-badge section-badge-client">Client-Facing</span>
            <h4 className="font-display font-semibold">Scope of Work</h4>
          </div>
          <div className="space-y-3">
            {quote.scopeOfWork.map((section, idx) => (
              <div key={idx}>
                <h5 className="font-medium text-sm text-primary mb-1">{section.title}</h5>
                <ul className="text-sm space-y-1 pl-4">
                  {section.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="text-muted-foreground list-disc">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Internal Breakdown (Toggle) */}
        {showInternal && (
          <section className="quote-section quote-section-internal">
            <div className="flex items-center gap-2 mb-3">
              <span className="section-badge section-badge-internal">Internal Only</span>
              <h4 className="font-display font-semibold">Cost & Margin Breakdown</h4>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-3">
              <p className="text-xs text-amber-800 font-medium">
                ⚠️ DO NOT share this section with clients
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-secondary/50 rounded-lg">
                <div className="text-xs text-muted-foreground">Internal Cost</div>
                <div className="font-semibold">{formatCurrency(quote.internalBreakdown.internalCost)}</div>
              </div>
              <div className="text-center p-3 bg-secondary/50 rounded-lg">
                <div className="text-xs text-muted-foreground">Client Price</div>
                <div className="font-semibold">{formatCurrency(quote.internalBreakdown.clientPrice)}</div>
              </div>
              <div className="text-center p-3 bg-primary/10 rounded-lg">
                <div className="text-xs text-muted-foreground">Gross Margin</div>
                <div className="font-semibold text-primary">{formatPercentage(quote.internalBreakdown.marginPercent)}</div>
              </div>
            </div>
            {quote.internalBreakdown.costBuckets.length > 0 && (
              <div className="text-sm">
                <h5 className="font-medium mb-2">Cost Buckets</h5>
                <div className="space-y-1">
                  {quote.internalBreakdown.costBuckets.map((bucket, idx) => (
                    <div key={idx} className="flex justify-between text-muted-foreground">
                      <span>{bucket.name}</span>
                      <span>{formatCurrency(bucket.internal)} IC / {formatCurrency(bucket.client)} CP</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Section 5: Assumptions & Open Questions */}
        <section className="quote-section border-muted">
          <h4 className="font-display font-semibold mb-3">Assumptions & Open Questions</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-sm font-medium text-muted-foreground mb-2">Assumptions Made</h5>
              <ul className="text-sm space-y-1">
                {quote.assumptions.map((item, idx) => (
                  <li key={idx} className="text-muted-foreground">• {item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-medium text-muted-foreground mb-2">To Confirm</h5>
              <ul className="text-sm space-y-1">
                {quote.openQuestions.map((item, idx) => (
                  <li key={idx} className="text-muted-foreground">• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function generateClientFacingText(quote: Quote): string {
  let text = `PROJECT QUOTE - THE KITCHEN & BATH STORE OF ORLANDO\n`;
  text += `${'='.repeat(50)}\n\n`;
  
  text += `PROJECT SNAPSHOT\n`;
  text += `-----------------\n`;
  text += `Project: ${quote.projectSnapshot.name}\n`;
  text += `Location: ${quote.projectSnapshot.location}\n`;
  text += `Rooms: ${quote.projectSnapshot.roomsSummary}\n`;
  text += `Scope: ${quote.projectSnapshot.scopeSummary}\n`;
  text += `Permit/GC: ${quote.projectSnapshot.permitGCSummary}\n\n`;
  
  text += `INVESTMENT SUMMARY\n`;
  text += `------------------\n`;
  text += `Estimated Range: ${formatCurrency(quote.priceSummary.lowEstimate)} – ${formatCurrency(quote.priceSummary.highEstimate)}\n`;
  text += `Recommended Quote: ${formatCurrency(quote.priceSummary.recommendedPrice)}\n`;
  text += `${quote.priceSummary.perSqftNote}\n\n`;
  
  text += `SCOPE OF WORK\n`;
  text += `-------------\n`;
  quote.scopeOfWork.forEach(section => {
    text += `\n${section.title.toUpperCase()}\n`;
    section.items.forEach(item => {
      text += `  • ${item}\n`;
    });
  });
  
  text += `\n\nASSUMPTIONS\n`;
  text += `-----------\n`;
  quote.assumptions.forEach(item => {
    text += `• ${item}\n`;
  });
  
  text += `\nQUESTIONS TO CONFIRM\n`;
  text += `--------------------\n`;
  quote.openQuestions.forEach(item => {
    text += `• ${item}\n`;
  });
  
  return text;
}
