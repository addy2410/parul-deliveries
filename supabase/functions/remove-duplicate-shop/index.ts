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

    console.log("Checking for duplicate Santushti Shakes shops");
    
    // Find all shops with the name "Santushti Shakes"
    const { data: shops, error: fetchError } = await supabaseClient
      .from('shops')
      .select('*')
      .eq('name', 'Santushti Shakes');
      
    if (fetchError) {
      console.error('Error fetching shops:', fetchError);
      throw new Error('Failed to fetch shops');
    }
    
    console.log(`Found ${shops.length} shops with the name "Santushti Shakes"`);
    
    if (shops.length <= 1) {
      return new Response(
        JSON.stringify({ success: true, message: 'No duplicate shops found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Find the shop with menu items
    let shopToKeep = null;
    for (const shop of shops) {
      const { data: menuItems, error: menuError } = await supabaseClient
        .from('menu_items')
        .select('id')
        .eq('shop_id', shop.id);
        
      if (menuError) {
        console.error('Error checking menu items:', menuError);
        continue;
      }
      
      console.log(`Shop ${shop.id} has ${menuItems.length} menu items`);
      
      if (menuItems.length > 0) {
        shopToKeep = shop;
        break;
      }
    }
    
    if (!shopToKeep) {
      // If no shop has menu items, keep the first one
      shopToKeep = shops[0];
      console.log(`No shop with menu items found. Keeping the first one: ${shopToKeep.id}`);
    } else {
      console.log(`Keeping shop with menu items: ${shopToKeep.id}`);
    }
    
    // Delete all other shops
    for (const shop of shops) {
      if (shop.id !== shopToKeep.id) {
        console.log(`Deleting duplicate shop: ${shop.id}`);
        const { error: deleteError } = await supabaseClient
          .from('shops')
          .delete()
          .eq('id', shop.id);
          
        if (deleteError) {
          console.error(`Error deleting shop ${shop.id}:`, deleteError);
        }
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Duplicate shops removed successfully',
        keptShopId: shopToKeep.id
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
