import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export function ProductMappingTestPanel() {
  const [testQuery, setTestQuery] = useState("delta shower valve");
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const { toast } = useToast();

  const testBigBoxConnection = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('bigbox-product-lookup', {
        body: {
          action: 'search',
          search: testQuery,
          zip_code: '32819',
        },
      });

      if (error) throw error;

      setTestResult({
        success: true,
        productsFound: data?.search_results?.length || 0,
        sampleProduct: data?.search_results?.[0] || null,
        rawData: data,
      });

      toast({
        title: "BigBox API Connected",
        description: `Found ${data?.search_results?.length || 0} products`,
      });
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message,
      });

      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">BigBox API Test</CardTitle>
          {testResult && (
            <Badge variant={testResult.success ? "default" : "destructive"}>
              {testResult.success ? (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Live
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Error
                </>
              )}
            </Badge>
          )}
        </div>
        <CardDescription>
          Test the BigBox API connection with a sample search (Orlando, FL 32819)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search query (e.g., 'delta shower valve')"
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && testBigBoxConnection()}
          />
          <Button onClick={testBigBoxConnection} disabled={isLoading || !testQuery.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {testResult && (
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            {testResult.success ? (
              <>
                <div>
                  <p className="text-sm font-medium">
                    ✓ Found {testResult.productsFound} products
                  </p>
                </div>
                
                {testResult.sampleProduct && (
                  <div className="border-t pt-3 mt-3">
                    <p className="text-xs font-medium mb-2">Sample Product:</p>
                    <div className="space-y-1 text-sm">
                      <p className="font-medium">{testResult.sampleProduct.product?.title}</p>
                      <p className="text-muted-foreground text-xs">
                        SKU: {testResult.sampleProduct.product?.item_id}
                      </p>
                      <p className="font-bold text-lg">
                        ${testResult.sampleProduct.offers?.primary?.price || 'N/A'}
                      </p>
                    </div>
                  </div>
                )}

                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    View raw response
                  </summary>
                  <pre className="mt-2 p-2 bg-background rounded overflow-auto max-h-40">
                    {JSON.stringify(testResult.rawData, null, 2)}
                  </pre>
                </details>
              </>
            ) : (
              <div className="text-destructive">
                <p className="text-sm font-medium">✗ Connection failed</p>
                <p className="text-xs mt-1">{testResult.error}</p>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1 border-t pt-3">
          <p>• Automated daily sync: 6:00 AM UTC (2:00 AM ET)</p>
          <p>• ZIP code: 32819 (Orlando, FL)</p>
          <p>• Manual sync available in Products tab</p>
        </div>
      </CardContent>
    </Card>
  );
}