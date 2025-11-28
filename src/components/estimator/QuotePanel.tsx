import { useEstimator } from '@/contexts/EstimatorContext';
import { ProjectSnapshotCard } from './ProjectSnapshotCard';
import { InvestmentSummary } from './InvestmentSummary';
import { TradeScopeAccordion } from './TradeScopeAccordion';
import { PaymentMilestones } from './PaymentMilestones';
import { ClientInfoForm } from './ClientInfoForm';
import { QuoteActions } from './QuoteActions';
import { cn } from '@/lib/utils';

export function QuotePanel() {
  const { state, hasValidInputs } = useEstimator();
  const showContent = hasValidInputs();
  
  return (
    <div className="h-full flex flex-col bg-card border-l">
      {/* Header */}
      <div className="border-b px-6 py-4 bg-muted/30">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Live Quote Preview
        </h2>
        <p className="text-sm text-muted-foreground">
          {showContent ? 'Updates as you describe your project' : 'Start describing your project to see live pricing'}
        </p>
      </div>
      
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {showContent ? (
          <div className="p-6 space-y-6">
            {/* Project Snapshot */}
            <ProjectSnapshotCard />
            
            {/* Investment Summary - THE HERO */}
            <InvestmentSummary />
            
            {/* Trade Scope Sections */}
            <TradeScopeAccordion />
            
            {/* Payment Milestones */}
            <PaymentMilestones />
            
            {/* Client Info (Stage 3) */}
            {(state.stage === 'client_details' || state.stage === 'generating' || state.stage === 'complete') && (
              <ClientInfoForm />
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">No Project Data Yet</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Tell me about your remodel project in the chat. Include room type, size, and scope for instant pricing.
            </p>
            <div className="mt-6 text-xs text-muted-foreground/60">
              <p>Example: "75 sq ft bathroom, full gut, no GC"</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Sticky Actions Footer */}
      {showContent && <QuoteActions />}
    </div>
  );
}
