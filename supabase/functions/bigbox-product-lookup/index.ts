import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const bigboxApiKey = Deno.env.get('BIGBOX_API_KEY');
    if (!bigboxApiKey) {
      throw new Error('BIGBOX_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, search, sku, zip_code = '32819' } = await req.json();

    console.log(`BigBox API request - Action: ${action}, Search: ${search}, SKU: ${sku}, ZIP: ${zip_code}`);

    let bigboxResponse;

    if (action === 'search') {
      // Search for products by query using GET with query params
      const searchParams = new URLSearchParams({
        api_key: bigboxApiKey,
        type: 'search',
        search_term: search,
        zip_code: zip_code,
      });
      
      const searchUrl = `https://api.bigboxapi.com/request?${searchParams.toString()}`;
      console.log('BigBox search URL:', searchUrl.replace(bigboxApiKey, 'HIDDEN'));
      
      bigboxResponse = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
    } else if (action === 'product') {
      // Get specific product details by SKU using GET with query params
      const productParams = new URLSearchParams({
        api_key: bigboxApiKey,
        type: 'product',
        product_id: sku,
        zip_code: zip_code,
      });
      
      const productUrl = `https://api.bigboxapi.com/request?${productParams.toString()}`;
      console.log('BigBox product URL:', productUrl.replace(bigboxApiKey, 'HIDDEN'));
      
      bigboxResponse = await fetch(productUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
    } else if (action === 'sync_prices') {
      // Sync prices for all active product mappings
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        throw new Error('Authorization required');
      }

      const { data: { user }, error: authError } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
      );

      if (authError || !user) {
        throw new Error('Unauthorized');
      }

      // Get user's contractor_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('contractor_id')
        .eq('id', user.id)
        .single();

      if (!profile?.contractor_id) {
        throw new Error('Contractor not found');
      }

      // Get all active product mappings
      const { data: mappings, error: mappingsError } = await supabase
        .from('product_mappings')
        .select('*')
        .eq('contractor_id', profile.contractor_id)
        .eq('is_active', true);

      if (mappingsError) {
        throw mappingsError;
      }

      const syncResults = [];

      // Fetch current prices for each SKU
      for (const mapping of mappings || []) {
        try {
          const productParams = new URLSearchParams({
            api_key: bigboxApiKey,
            type: 'product',
            product_id: mapping.sku,
            zip_code: zip_code,
          });
          
          const productUrl = `https://api.bigboxapi.com/request?${productParams.toString()}`;
          const productResponse = await fetch(productUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
          });

          if (productResponse.ok) {
            const responseText = await productResponse.text();
            const productData = JSON.parse(responseText);
            const newPrice = productData.product?.offers?.primary?.price || mapping.current_price;

            // Update mapping with new price
            const { error: updateError } = await supabase
              .from('product_mappings')
              .update({
                current_price: newPrice,
                last_synced_at: new Date().toISOString(),
              })
              .eq('id', mapping.id);

            if (!updateError) {
              // Update pricing_configs
              const { error: pricingError } = await supabase
                .from('pricing_configs')
                .update({
                  [mapping.pricing_field]: newPrice,
                  updated_at: new Date().toISOString(),
                })
                .eq('contractor_id', profile.contractor_id);

              syncResults.push({
                sku: mapping.sku,
                success: !pricingError,
                old_price: mapping.current_price,
                new_price: newPrice,
              });
            }
          }
        } catch (err) {
          console.error(`Error syncing SKU ${mapping.sku}:`, err);
          syncResults.push({
            sku: mapping.sku,
            success: false,
            error: err instanceof Error ? err.message : 'Unknown error',
          });
        }
      }

      return new Response(
        JSON.stringify({ results: syncResults }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      throw new Error('Invalid action');
    }

    console.log('BigBox Response Status:', bigboxResponse.status);
    console.log('BigBox Response Headers:', Object.fromEntries(bigboxResponse.headers.entries()));
    
    if (!bigboxResponse.ok) {
      const errorText = await bigboxResponse.text();
      console.error('BigBox API error response:', errorText);
      throw new Error(`BigBox API returned ${bigboxResponse.status}: ${errorText.substring(0, 200)}`);
    }

    // Get response text first to debug
    const responseText = await bigboxResponse.text();
    console.log('BigBox raw response (first 500 chars):', responseText.substring(0, 500));
    
    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse BigBox response as JSON:', parseError);
      throw new Error(`BigBox API returned invalid JSON. Response starts with: ${responseText.substring(0, 100)}`);
    }

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in bigbox-product-lookup function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});