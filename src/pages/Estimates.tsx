import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/pricing-calculator';
import { Search, FileText, Plus, Clock, MapPin, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface EstimateRow {
  id: string;
  job_label: string | null;
  client_name: string | null;
  city: string | null;
  state: string | null;
  final_cp_total: number;
  low_estimate_cp: number;
  high_estimate_cp: number;
  has_kitchen: boolean;
  has_bathrooms: boolean;
  has_closets: boolean;
  num_kitchens: number;
  num_bathrooms: number;
  num_closets: number;
  status: string;
  created_at: string;
}

export default function Estimates() {
  const { contractor } = useAuth();
  const [estimates, setEstimates] = useState<EstimateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteTarget, setDeleteTarget] = useState<EstimateRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchEstimates() {
      if (!contractor) return;
      
      const { data, error } = await supabase
        .from('estimates')
        .select('id, job_label, client_name, city, state, final_cp_total, low_estimate_cp, high_estimate_cp, has_kitchen, has_bathrooms, has_closets, num_kitchens, num_bathrooms, num_closets, status, created_at')
        .eq('contractor_id', contractor.id)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setEstimates(data);
      }
      setLoading(false);
    }
    
    fetchEstimates();
  }, [contractor]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    setDeleting(true);
    const { error } = await supabase
      .from('estimates')
      .delete()
      .eq('id', deleteTarget.id);
    
    if (error) {
      toast.error('Failed to delete estimate');
    } else {
      setEstimates(estimates.filter(e => e.id !== deleteTarget.id));
      toast.success('Estimate deleted');
    }
    setDeleting(false);
    setDeleteTarget(null);
  };

  const filteredEstimates = estimates.filter((estimate) => {
    const matchesSearch = 
      (estimate.job_label?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (estimate.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (estimate.city?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    
    const matchesStatus = statusFilter === 'all' || estimate.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-secondary text-secondary-foreground';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'won': return 'bg-emerald-100 text-emerald-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getProjectSummary = (estimate: EstimateRow) => {
    const parts: string[] = [];
    if (estimate.has_kitchen) parts.push(`${estimate.num_kitchens || 1} Kitchen`);
    if (estimate.has_bathrooms) parts.push(`${estimate.num_bathrooms || 1} Bath`);
    if (estimate.has_closets) parts.push(`${estimate.num_closets || 1} Closet`);
    return parts.join(' + ') || 'No rooms specified';
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-display">Estimates</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">View and manage all your quotes</p>
        </div>
        <Link to="/estimator" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            New Quote
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-4 sm:mb-6">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by job name, client, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
                className="flex-shrink-0"
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'draft' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('draft')}
                className="flex-shrink-0"
              >
                Draft
              </Button>
              <Button
                variant={statusFilter === 'sent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('sent')}
                className="flex-shrink-0"
              >
                Sent
              </Button>
              <Button
                variant={statusFilter === 'won' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('won')}
                className="flex-shrink-0"
              >
                Won
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estimates List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-sm">Loading estimates...</p>
        </div>
      ) : filteredEstimates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">No estimates found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Start by creating your first quote'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Link to="/estimator">
                <Button size="sm">Create Your First Quote</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {filteredEstimates.map((estimate) => (
            <Card key={estimate.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <Link to={`/estimates/${estimate.id}`} className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 sm:p-3 rounded-lg bg-secondary flex-shrink-0">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-secondary-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-sm sm:text-base truncate">
                          {estimate.job_label || estimate.client_name || 'Untitled Estimate'}
                        </h3>
                        <Badge className={`${getStatusColor(estimate.status)} text-xs`}>
                          {estimate.status}
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {getProjectSummary(estimate)}
                      </p>
                      {(estimate.city || estimate.state) && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {[estimate.city, estimate.state].filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>
                  </Link>
                  <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0">
                    <Link to={`/estimates/${estimate.id}`} className="text-left sm:text-right">
                      <p className="text-base sm:text-lg font-bold">{formatCurrency(estimate.final_cp_total)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(estimate.low_estimate_cp)} - {formatCurrency(estimate.high_estimate_cp)}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 sm:justify-end">
                        <Clock className="h-3 w-3" />
                        {new Date(estimate.created_at).toLocaleDateString()}
                      </p>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDeleteTarget(estimate);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Estimate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.job_label || deleteTarget?.client_name || 'this estimate'}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
