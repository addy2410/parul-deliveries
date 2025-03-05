
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find all shops named "Santushti Shakes"
    const { data: shops, error: shopError } = await supabaseClient
      .from('shops')
      .select('id, name')
      .eq('name', 'Santushti Shakes');
      
    if (shopError) {
      console.error('Error fetching shops:', shopError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch shops' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    console.log(`Found ${shops.length} shops named "Santushti Shakes"`);
    
    if (shops.length <= 1) {
      return new Response(
        JSON.stringify({ success: true, message: 'Only one shop found, no need to delete' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // For each shop, check if it has menu items
    const emptyShops = [];
    for (const shop of shops) {
      const { data: menuItems, error: menuError } = await supabaseClient
        .from('menu_items')
        .select('id')
        .eq('shop_id', shop.id);
        
      if (menuError) {
        console.error(`Error fetching menu items for shop ${shop.id}:`, menuError);
        continue;
      }
      
      if (!menuItems || menuItems.length === 0) {
        emptyShops.push(shop.id);
      }
    }
    
    console.log(`Found ${emptyShops.length} empty shops to delete`);
    
    if (emptyShops.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No empty shops found to delete' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Delete empty shops
    const { error: deleteError } = await supabaseClient
      .from('shops')
      .delete()
      .in('id', emptyShops);
      
    if (deleteError) {
      console.error('Error deleting empty shops:', deleteError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to delete empty shops' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully deleted ${emptyShops.length} empty shops`,
        deletedShopIds: emptyShops
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
