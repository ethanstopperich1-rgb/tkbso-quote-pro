import { Quote } from "@/types/estimator";
import { formatCurrency, formatPercentage } from "@/lib/pricing";
import { Copy, Check, Eye, EyeOff, FileText } from "lucide-react";
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
          Quote Ready
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
            {showInternal ? "Hide Internal" : "Internal View"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyClientFacingQuote}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
            Copy
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* PROJECT SNAPSHOT - Clean, human language */}
        <section className="quote-section quote-section-client">
          <h4 className="font-display font-semibold text-primary mb-3">Project Snapshot</h4>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {quote.clientInfo?.name && (
              <div>
                <dt className="text-muted-foreground text-xs uppercase tracking-wide">Client</dt>
                <dd className="font-medium">{quote.clientInfo.name}</dd>
              </div>
            )}
            <div>
              <dt className="text-muted-foreground text-xs uppercase tracking-wide">Location</dt>
              <dd className="font-medium">{quote.projectSnapshot.location}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs uppercase tracking-wide">Rooms</dt>
              <dd className="font-medium">{quote.projectSnapshot.roomsSummary}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs uppercase tracking-wide">Scope</dt>
              <dd className="font-medium">{quote.projectSnapshot.scopeSummary}</dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-muted-foreground text-xs uppercase tracking-wide">Permit/GC</dt>
              <dd className="font-medium">{quote.projectSnapshot.permitGCSummary}</dd>
            </div>
          </dl>
        </section>

        {/* INVESTMENT SUMMARY - THE HERO */}
        <section className="bg-primary rounded-xl p-6 text-center">
          <div className="text-primary-foreground/80 text-sm uppercase tracking-wider mb-2">
            Recommended TKBSO Quote
          </div>
          <div className="text-4xl font-display font-bold text-primary-foreground mb-3">
            {formatCurrency(quote.priceSummary.recommendedPrice)}
          </div>
          <div className="text-primary-foreground/70 text-sm">
            Based on similar projects: {formatCurrency(quote.priceSummary.lowEstimate)} – {formatCurrency(quote.priceSummary.highEstimate)}
          </div>
        </section>

        {/* SCOPE OF WORK - No prices, just scope */}
        <section className="quote-section quote-section-client">
          <h4 className="font-display font-semibold text-primary mb-3">Scope of Work</h4>
          <div className="grid md:grid-cols-2 gap-4">
            {quote.scopeOfWork.map((section, idx) => (
              <div key={idx} className="space-y-1">
                <h5 className="font-medium text-sm">{section.title}</h5>
                <ul className="text-sm space-y-0.5 text-muted-foreground">
                  {section.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* PAYMENT MILESTONES */}
        <section className="quote-section bg-secondary/30 rounded-lg p-4">
          <h4 className="font-display font-semibold text-primary mb-3">Payment Milestones</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-3">
                <span className="font-bold text-primary">65%</span>
                <span className="text-sm">Deposit – lock materials, schedule trades</span>
              </div>
              <span className="font-semibold">{formatCurrency(quote.priceSummary.recommendedPrice * 0.65)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-3">
                <span className="font-bold text-primary">25%</span>
                <span className="text-sm">Progress – rough-in complete, tile installed</span>
              </div>
              <span className="font-semibold">{formatCurrency(quote.priceSummary.recommendedPrice * 0.25)}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <span className="font-bold text-primary">10%</span>
                <span className="text-sm">Final – completion + punch list</span>
              </div>
              <span className="font-semibold">{formatCurrency(quote.priceSummary.recommendedPrice * 0.10)}</span>
            </div>
          </div>
        </section>

        {/* INTERNAL BREAKDOWN (Toggle) - Contractor eyes only */}
        {showInternal && (
          <section className="quote-section border-2 border-amber-300 bg-amber-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded font-semibold">INTERNAL ONLY</span>
              <h4 className="font-display font-semibold">Cost & Margin Breakdown</h4>
            </div>
            <p className="text-xs text-amber-800 mb-4">
              ⚠️ This section is for internal use only. Never share with clients.
            </p>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-white rounded-lg border">
                <div className="text-xs text-muted-foreground">Internal Cost</div>
                <div className="font-semibold text-lg">{formatCurrency(quote.internalBreakdown.internalCost)}</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <div className="text-xs text-muted-foreground">Client Price</div>
                <div className="font-semibold text-lg">{formatCurrency(quote.internalBreakdown.clientPrice)}</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-xs text-green-700">Gross Margin</div>
                <div className="font-semibold text-lg text-green-700">{formatPercentage(quote.internalBreakdown.marginPercent)}</div>
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
            
            {/* Assumptions - Internal only */}
            <div className="mt-4 pt-4 border-t border-amber-200">
              <h5 className="font-medium mb-2">Assumptions (Internal)</h5>
              <ul className="text-sm space-y-1 text-muted-foreground">
                {quote.assumptions.map((item, idx) => (
                  <li key={idx}>• {item}</li>
                ))}
              </ul>
            </div>
            
            {/* Open Questions - Internal only */}
            {quote.openQuestions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-amber-200">
                <h5 className="font-medium mb-2">To Confirm (Internal)</h5>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  {quote.openQuestions.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

// Client-facing text for copy/paste - NO internal data
function generateClientFacingText(quote: Quote): string {
  let text = `THE KITCHEN & BATH STORE OF ORLANDO\n`;
  text += `${'═'.repeat(45)}\n\n`;
  
  text += `${quote.projectSnapshot.name.toUpperCase()}\n\n`;
  
  text += `PROJECT SNAPSHOT\n`;
  text += `────────────────\n`;
  if (quote.clientInfo?.name) text += `Client: ${quote.clientInfo.name}\n`;
  text += `Location: ${quote.projectSnapshot.location}\n`;
  text += `Rooms: ${quote.projectSnapshot.roomsSummary}\n`;
  text += `Scope: ${quote.projectSnapshot.scopeSummary}\n`;
  text += `Permit: ${quote.projectSnapshot.permitGCSummary}\n\n`;
  
  text += `RECOMMENDED TKBSO QUOTE\n`;
  text += `───────────────────────\n`;
  text += `${formatCurrency(quote.priceSummary.recommendedPrice)}\n`;
  text += `(Based on similar projects: ${formatCurrency(quote.priceSummary.lowEstimate)} – ${formatCurrency(quote.priceSummary.highEstimate)})\n\n`;
  
  text += `SCOPE OF WORK\n`;
  text += `─────────────\n`;
  quote.scopeOfWork.forEach(section => {
    text += `\n${section.title}\n`;
    section.items.forEach(item => {
      text += `  • ${item}\n`;
    });
  });
  
  text += `\n\nPAYMENT MILESTONES\n`;
  text += `──────────────────\n`;
  text += `65% Deposit – lock materials, schedule trades: ${formatCurrency(quote.priceSummary.recommendedPrice * 0.65)}\n`;
  text += `25% Progress – rough-in complete, tile installed: ${formatCurrency(quote.priceSummary.recommendedPrice * 0.25)}\n`;
  text += `10% Final – completion + punch list: ${formatCurrency(quote.priceSummary.recommendedPrice * 0.10)}\n`;
  
  return text;
}
