
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

    const { 
      items, 
      totalAmount, 
      restaurantId, 
      studentId, 
      studentName,
      deliveryLocation 
    } = await req.json();
    
    if (!items || !totalAmount || !restaurantId || !studentId || !deliveryLocation) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields for order' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Get vendor ID from restaurant
    const { data: shop, error: shopError } = await supabaseClient
      .from('shops')
      .select('vendor_id')
      .eq('id', restaurantId)
      .single();
      
    if (shopError) {
      console.error('Error fetching shop:', shopError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to get restaurant information' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    const vendorId = shop.vendor_id;
    const createdAt = new Date().toISOString();
    const estimatedDeliveryTime = '25-35 min';
    
    // Create the order
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert([{
        restaurant_id: restaurantId,
        student_id: studentId,
        student_name: studentName,
        items: items,
        total_amount: totalAmount,
        status: 'pending',
        created_at: createdAt,
        delivery_location: deliveryLocation,
        estimated_delivery_time: estimatedDeliveryTime,
        vendor_id: vendorId
      }])
      .select()
      .single();
      
    if (orderError) {
      console.error('Error creating order:', orderError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create order' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Create notification for vendor
    const { error: notificationError } = await supabaseClient
      .from('notifications')
      .insert([{
        recipient_id: vendorId,
        type: 'new_order',
        message: `New order (#${order.id.slice(0, 8)}) received`,
        data: { orderId: order.id },
        is_read: false
      }]);
      
    if (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Continue anyway, as the order was created successfully
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        orderId: order.id,
        message: 'Order placed successfully'
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
