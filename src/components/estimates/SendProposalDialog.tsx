import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { SimpleProposalPdf } from '@/components/pdf/SimpleProposalPdf';
import { extractPassthroughLineItems, calculatePassthroughTotal } from '@/lib/estimate-passthrough';
import { Estimate, PricingConfig, Contractor } from '@/types/database';
import { formatCurrency } from '@/lib/pricing-calculator';
import { Send, RefreshCw, Mail, FileText, AlertTriangle } from 'lucide-react';
import { ContractorSettings, defaultSettings } from '@/types/settings';

interface SendProposalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimate: Estimate;
  contractor: Contractor;
  pricingConfig: PricingConfig | null;
  selectedPrice: number;
  onSent: () => void;
}

export function SendProposalDialog({
  open,
  onOpenChange,
  estimate,
  contractor,
  pricingConfig,
  selectedPrice,
  onSent,
}: SendProposalDialogProps) {
  const [sending, setSending] = useState(false);
  const [email, setEmail] = useState(estimate.client_email || '');
  const [customMessage, setCustomMessage] = useState(
    `Thank you for the opportunity to provide you with this proposal for your ${estimate.job_label || 'remodeling project'}.\n\nWe've carefully reviewed your project requirements and are excited to help bring your vision to life. This proposal includes a detailed breakdown of the work to be performed.`
  );

  // Get contractor settings
  const settings: ContractorSettings = (contractor.settings as ContractorSettings) || defaultSettings;
  const sendingDomain = settings.companyProfile?.sendingDomain;

  const handleSend = async () => {
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    if (!email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setSending(true);
    try {
      // STRICT PASSTHROUGH: Use SimpleProposalPdf with exact line items
      const lineItems = extractPassthroughLineItems(estimate);
      const total = selectedPrice || calculatePassthroughTotal(lineItems);

      const pdfBlob = await pdf(
        <SimpleProposalPdf
          contractor={contractor}
          estimate={estimate}
          lineItems={lineItems}
          total={total}
        />
      ).toBlob();

      // Convert blob to base64
      const reader = new FileReader();
      const pdfBase64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          // Remove the data:application/pdf;base64, prefix
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(pdfBlob);
      });

      // Generate filename
      const clientName = estimate.client_name?.replace(/[^a-zA-Z0-9]/g, '_') || '';
      const jobLabel = estimate.job_label?.replace(/[^a-zA-Z0-9]/g, '_') || '';
      const pdfFilename = clientName || jobLabel
        ? `Proposal_${clientName}${jobLabel ? '_' + jobLabel : ''}.pdf`
        : `Proposal_${estimate.id}.pdf`;

      // Send email via edge function
      const { data, error } = await supabase.functions.invoke('send-proposal-email', {
        body: {
          to: email,
          clientName: estimate.client_name || 'Valued Customer',
          contractorName: contractor.name,
          contractorEmail: contractor.primary_contact_email,
          contractorPhone: contractor.primary_contact_phone,
          projectLabel: estimate.job_label || 'Remodeling Project',
          customMessage,
          investmentAmount: formatCurrency(selectedPrice),
          pdfBase64,
          pdfFilename,
          sendingDomain, // Pass verified domain for sending to any email
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to send email');

      // Update estimate status to sent
      await supabase
        .from('estimates')
        .update({ status: 'sent' })
        .eq('id', estimate.id);

      toast.success(`Proposal sent to ${email}!`);
      onSent();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error sending proposal:', error);
      toast.error(error.message || 'Failed to send proposal. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-sky-500" />
            Send Proposal
          </DialogTitle>
          <DialogDescription>
            Send the PDF proposal directly to your client's email.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Warning if no sending domain */}
          {!sendingDomain && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800">Email Sending Limited</p>
                <p className="text-amber-700 mt-1">
                  Without a verified sending domain, proposals can only be sent to your registered email. 
                  <a href="/settings" className="text-amber-800 underline ml-1">Add a sending domain in Settings</a> to send to any client.
                </p>
              </div>
            </div>
          )}

          {/* Proposal Summary */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <FileText className="h-8 w-8 text-slate-400" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {estimate.job_label || estimate.client_name || 'Proposal'}
              </p>
              <p className="text-xs text-muted-foreground">
                Investment: {formatCurrency(selectedPrice)}
              </p>
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email">Client Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="client@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Personal Message</Label>
            <Textarea
              id="message"
              placeholder="Add a personal message to your proposal..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              This message will appear in the email body above the investment amount.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending} className="gap-2">
            {sending ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Proposal
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
