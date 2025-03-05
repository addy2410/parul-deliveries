
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

    const { orderId, status, vendorId } = await req.json();
    
    if (!orderId || !status || !vendorId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Order ID, status, and vendor ID are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Validate the status value
    const validStatuses = ['accepted', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid status value' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Check if the order belongs to this vendor
    const { data: order, error: fetchError } = await supabaseClient
      .from('orders')
      .select('id, student_id, status')
      .eq('id', orderId)
      .eq('vendor_id', vendorId)
      .single();
      
    if (fetchError) {
      console.error('Error fetching order:', fetchError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch order or order not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }
    
    // Update the order status
    const { error: updateError } = await supabaseClient
      .from('orders')
      .update({ status: status })
      .eq('id', orderId);
      
    if (updateError) {
      console.error('Error updating order:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to update order status' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Create notification for student
    let notificationMessage = '';
    switch (status) {
      case 'accepted':
        notificationMessage = 'Your order has been accepted by the restaurant';
        break;
      case 'preparing':
        notificationMessage = 'Your order is being prepared';
        break;
      case 'ready':
        notificationMessage = 'Your order is ready for delivery';
        break;
      case 'delivering':
        notificationMessage = 'Your order is on the way';
        break;
      case 'delivered':
        notificationMessage = 'Your order has been delivered';
        break;
      case 'cancelled':
        notificationMessage = 'Your order has been cancelled by the restaurant';
        break;
    }
    
    const { error: notificationError } = await supabaseClient
      .from('notifications')
      .insert([{
        recipient_id: order.student_id,
        type: 'order_update',
        message: notificationMessage,
        data: { orderId: orderId, status: status },
        is_read: false
      }]);
      
    if (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Continue anyway as the order status was updated successfully
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Order status updated successfully'
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
