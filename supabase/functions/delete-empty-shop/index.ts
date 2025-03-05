
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

    // First, identify shops without menu items
    const { data: shops, error: shopsError } = await supabaseClient
      .from('shops')
      .select('id, name');
    
    if (shopsError) {
      console.error("Failed to fetch shops:", shopsError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch shops: ' + shopsError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Check each shop for menu items
    let emptyShops = [];
    for (const shop of shops || []) {
      const { data: menuItems, error: menuError } = await supabaseClient
        .from('menu_items')
        .select('id')
        .eq('shop_id', shop.id);
        
      if (menuError) {
        console.error(`Failed to check menu items for shop ${shop.id}:`, menuError);
        continue;
      }
      
      if (!menuItems || menuItems.length === 0) {
        emptyShops.push(shop);
      }
    }
    
    // Delete the empty shops
    if (emptyShops.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No empty shops found to delete.", deletedCount: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    let deletedShops = 0;
    for (const shop of emptyShops) {
      const { error: deleteError } = await supabaseClient
        .from('shops')
        .delete()
        .eq('id', shop.id);
        
      if (deleteError) {
        console.error(`Failed to delete shop ${shop.id}:`, deleteError);
        continue;
      }
      
      deletedShops++;
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully deleted ${deletedShops} empty shops.`,
        deletedCount: deletedShops
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Failed to delete empty shops:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
