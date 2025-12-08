import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, SkipForward } from 'lucide-react';

interface ClientDetails {
  name: string;
  phone: string;
  email: string;
  address: string;
}

interface ClientDetailsFormProps {
  onSubmit: (details: ClientDetails) => void;
  onSkip: () => void;
  isLoading?: boolean;
}

export function ClientDetailsForm({ onSubmit, onSkip, isLoading }: ClientDetailsFormProps) {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');

  const handleSubmit = () => {
    onSubmit({
      name: clientName,
      phone: clientPhone,
      email: clientEmail,
      address: clientAddress,
    });
  };

  const isValid = clientName.trim().length > 0;

  return (
    <div className="bg-primary/5 border-l-4 border-primary p-4 my-4 rounded-r-lg animate-fade-in">
      <p className="font-semibold mb-3 text-foreground">
        I have everything for the scope. Now I need client details:
      </p>
      
      <div className="space-y-3">
        <div>
          <Label htmlFor="clientName" className="text-sm text-muted-foreground">
            Client Name *
          </Label>
          <Input
            id="clientName"
            placeholder="Brian Lomonico"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="mt-1"
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="clientPhone" className="text-sm text-muted-foreground">
            Phone Number
          </Label>
          <Input
            id="clientPhone"
            placeholder="(555) 123-4567"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            className="mt-1"
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="clientEmail" className="text-sm text-muted-foreground">
            Email
          </Label>
          <Input
            id="clientEmail"
            type="email"
            placeholder="brian@example.com"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            className="mt-1"
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="clientAddress" className="text-sm text-muted-foreground">
            Property Address
          </Label>
          <Input
            id="clientAddress"
            placeholder="123 Main St, Orlando, FL 32819"
            value={clientAddress}
            onChange={(e) => setClientAddress(e.target.value)}
            className="mt-1"
            disabled={isLoading}
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isLoading}
            className="flex-1"
          >
            Generate Quote
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            onClick={onSkip}
            disabled={isLoading}
            className="text-muted-foreground"
          >
            <SkipForward className="mr-2 h-4 w-4" />
            Skip
          </Button>
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground mt-3">
        * At minimum, provide the client name. You can add other details later.
      </p>
    </div>
  );
}
