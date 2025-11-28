import { useState } from 'react';
import { useEstimator } from '@/contexts/EstimatorContext';
import { Button } from '@/components/ui/button';
import { QuotePDFGenerator } from '@/components/QuotePDFGenerator';
import { FileText, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function QuoteActions() {
  const { state, setStage, generateQuote, setFinalQuote, hasCompleteClientInfo, canProceed } = useEstimator();
  const [isSaving, setIsSaving] = useState(false);
  
  const handleConfirmAssumptions = () => {
    setStage('client_details');
    toast({
      title: "Assumptions confirmed",
      description: "Now enter client details to generate the quote.",
    });
  };
  
  const handleGenerateQuote = () => {
    if (!hasCompleteClientInfo()) {
      toast({
        title: "Missing client info",
        description: "Please fill in client name, address, city, and state.",
        variant: "destructive",
      });
      return;
    }
    
    const quote = generateQuote();
    setFinalQuote(quote);
    toast({
      title: "Quote generated!",
      description: "Your client-ready proposal is ready to download.",
    });
  };
  
  const handleSaveQuote = async () => {
    setIsSaving(true);
    // TODO: Save to Supabase
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsSaving(false);
    toast({
      title: "Quote saved",
      description: "Estimate has been saved to your account.",
    });
  };
  
  // Determine which buttons to show based on stage
  const showConfirmButton = state.stage === 'collecting' || state.stage === 'confirming';
  const showGenerateButton = state.stage === 'client_details';
  const showPDFButton = state.stage === 'complete' && state.finalQuote;
  const showSaveButton = state.stage === 'complete' && state.finalQuote;
  
  return (
    <div className="border-t bg-card px-6 py-4 flex items-center justify-between gap-3">
      <div className="text-sm text-muted-foreground">
        {state.stage === 'collecting' && (
          <span className="flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            Describe project in chat
          </span>
        )}
        {state.stage === 'confirming' && (
          <span className="flex items-center gap-1 text-amber-600">
            <AlertCircle className="w-4 h-4" />
            Review & confirm assumptions
          </span>
        )}
        {state.stage === 'client_details' && (
          <span className="flex items-center gap-1 text-amber-600">
            <AlertCircle className="w-4 h-4" />
            Enter client details above
          </span>
        )}
        {state.stage === 'complete' && (
          <span className="flex items-center gap-1 text-green-600">
            <CheckCircle2 className="w-4 h-4" />
            Quote ready
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {showConfirmButton && (
          <Button
            onClick={handleConfirmAssumptions}
            disabled={!canProceed()}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Confirm Assumptions
          </Button>
        )}
        
        {showGenerateButton && (
          <Button
            onClick={handleGenerateQuote}
            className="bg-green-600 hover:bg-green-700"
          >
            <FileText className="w-4 h-4 mr-2" />
            Generate Quote
          </Button>
        )}
        
        {showSaveButton && (
          <Button variant="outline" onClick={handleSaveQuote} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        )}
        
        {showPDFButton && state.finalQuote && (
          <QuotePDFGenerator quote={state.finalQuote} />
        )}
      </div>
    </div>
  );
}
