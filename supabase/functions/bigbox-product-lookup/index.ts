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
      // Search for products by query
      const searchUrl = `https://www.bigboxapi.com/api/v1/search`;
      bigboxResponse = await fetch(searchUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': bigboxApiKey,
        },
        body: JSON.stringify({
          type: 'search',
          search_term: search,
          zip_code: zip_code,
          output: 'json',
        }),
      });
    } else if (action === 'product') {
      // Get specific product details by SKU
      const productUrl = `https://www.bigboxapi.com/api/v1/product`;
      bigboxResponse = await fetch(productUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': bigboxApiKey,
        },
        body: JSON.stringify({
          type: 'product',
          product_id: sku,
          zip_code: zip_code,
          output: 'json',
        }),
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
          const productUrl = `https://www.bigboxapi.com/api/v1/product`;
          const productResponse = await fetch(productUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-API-KEY': bigboxApiKey,
            },
            body: JSON.stringify({
              type: 'product',
              product_id: mapping.sku,
              zip_code: zip_code,
              output: 'json',
            }),
          });

          if (productResponse.ok) {
            const productData = await productResponse.json();
            const newPrice = productData.product?.pricing?.current_price || mapping.current_price;

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

    if (!bigboxResponse.ok) {
      const errorText = await bigboxResponse.text();
      console.error('BigBox API error:', errorText);
      throw new Error(`BigBox API error: ${bigboxResponse.status} - ${errorText}`);
    }

    const data = await bigboxResponse.json();

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