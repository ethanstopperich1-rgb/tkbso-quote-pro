import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductMappingTestPanel } from "./ProductMappingTestPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, Plus, Search, Trash2, MapPin } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface ProductMapping {
  id: string;
  sku: string;
  product_name: string;
  trade_bucket: string;
  pricing_field: string;
  current_price: number;
  last_synced_at: string | null;
  is_active: boolean;
}

const TRADE_BUCKETS = [
  { value: 'tile', label: 'Tile & Waterproofing' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'vanities', label: 'Vanities & Countertops' },
  { value: 'glass', label: 'Shower Glass' },
  { value: 'fixtures', label: 'Fixtures & Hardware' },
  { value: 'demo', label: 'Demo & Prep' },
  { value: 'cabinets', label: 'Cabinets' },
];

export function ProductMappingCard() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTradeBucket, setSelectedTradeBucket] = useState("");
  const [selectedPricingField, setSelectedPricingField] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: mappings, isLoading } = useQuery({
    queryKey: ['product-mappings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_mappings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ProductMapping[];
    },
  });

  const searchProducts = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('bigbox-product-lookup', {
        body: {
          action: 'search',
          search: searchQuery,
          zip_code: '32819',
        },
      });

      if (error) throw error;

      setSearchResults(data.products || []);
      
      if (!data.products || data.products.length === 0) {
        toast({
          title: "No products found",
          description: "Try a different search term",
        });
      }
    } catch (error: any) {
      toast({
        title: "Search failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const addMappingMutation = useMutation({
    mutationFn: async (product: any) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('contractor_id')
        .single();

      if (!profile?.contractor_id) throw new Error('Contractor not found');

      const { error } = await supabase
        .from('product_mappings')
        .insert({
          contractor_id: profile.contractor_id,
          sku: product.product_id,
          product_name: product.title,
          product_description: product.description,
          trade_bucket: selectedTradeBucket,
          pricing_field: selectedPricingField,
          current_price: product.pricing?.current_price || 0,
          is_active: true,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-mappings'] });
      toast({
        title: "Product mapped",
        description: "Product has been added to your pricing system",
      });
      setIsSearchOpen(false);
      setSearchQuery("");
      setSearchResults([]);
      setSelectedTradeBucket("");
      setSelectedPricingField("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to map product",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMappingMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('product_mappings')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-mappings'] });
      toast({
        title: "Mapping deleted",
        description: "Product mapping has been removed",
      });
    },
  });

  const syncPricesMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('bigbox-product-lookup', {
        body: { action: 'sync_prices' },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['product-mappings'] });
      const successCount = data.results.filter((r: any) => r.success).length;
      toast({
        title: "Prices synced",
        description: `Updated ${successCount} of ${data.results.length} products`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Sync failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <ProductMappingTestPanel />
      
      <Card>
        <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Product Mapping (Orlando, FL 32819)
            </CardTitle>
            <CardDescription>
              Map Home Depot products to your trade buckets for real-time pricing
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Search Home Depot Products</DialogTitle>
                  <DialogDescription>
                    Search for products and map them to your pricing buckets
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search products (e.g., 'delta shower valve')"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && searchProducts()}
                    />
                    <Button onClick={searchProducts} disabled={isSearching}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="space-y-2">
                      {searchResults.map((product: any) => (
                        <Card key={product.product_id} className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium">{product.title}</h4>
                              <p className="text-sm text-muted-foreground">{product.product_id}</p>
                              <p className="text-lg font-bold mt-2">
                                ${product.pricing?.current_price || 'N/A'}
                              </p>
                            </div>
                            <div className="space-y-2 ml-4">
                              <Select value={selectedTradeBucket} onValueChange={setSelectedTradeBucket}>
                                <SelectTrigger className="w-48">
                                  <SelectValue placeholder="Trade bucket" />
                                </SelectTrigger>
                                <SelectContent>
                                  {TRADE_BUCKETS.map((bucket) => (
                                    <SelectItem key={bucket.value} value={bucket.value}>
                                      {bucket.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Input
                                placeholder="Pricing field (e.g., plumbing_shower_standard_cp)"
                                value={selectedPricingField}
                                onChange={(e) => setSelectedPricingField(e.target.value)}
                              />
                              <Button
                                size="sm"
                                onClick={() => addMappingMutation.mutate(product)}
                                disabled={!selectedTradeBucket || !selectedPricingField}
                              >
                                Map Product
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              size="sm"
              onClick={() => syncPricesMutation.mutate()}
              disabled={syncPricesMutation.isPending || !mappings?.length}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncPricesMutation.isPending ? 'animate-spin' : ''}`} />
              Sync Prices
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading mappings...</div>
        ) : !mappings || mappings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No product mappings yet. Add products to start tracking real-time prices.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Trade Bucket</TableHead>
                <TableHead>Pricing Field</TableHead>
                <TableHead>Current Price</TableHead>
                <TableHead>Last Synced</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mappings.map((mapping) => (
                <TableRow key={mapping.id}>
                  <TableCell className="font-medium">{mapping.product_name}</TableCell>
                  <TableCell className="font-mono text-sm">{mapping.sku}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {TRADE_BUCKETS.find(b => b.value === mapping.trade_bucket)?.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{mapping.pricing_field}</TableCell>
                  <TableCell className="font-semibold">${mapping.current_price.toFixed(2)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {mapping.last_synced_at 
                      ? new Date(mapping.last_synced_at).toLocaleDateString()
                      : 'Never'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={mapping.is_active ? "default" : "secondary"}>
                      {mapping.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMappingMutation.mutate(mapping.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
    </div>
  );
}