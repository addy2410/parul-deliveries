
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StatusUpdateRequest {
  orderId: string;
  status: 'accepted' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled';
  vendorId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const requestData: StatusUpdateRequest = await req.json();
    const { orderId, status, vendorId } = requestData;

    console.log('Received status update request:', JSON.stringify(requestData, null, 2));

    // Validate request
    if (!orderId || !status || !vendorId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required information (orderId, status, or vendorId)'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Verify the vendor is authorized to update this order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('id, vendor_id, student_id, status')
      .eq('id', orderId)
      .single();

    if (orderError) {
      console.error('Error fetching order:', orderError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Order not found'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Check if the vendor is authorized to update this order
    if (orderData.vendor_id !== vendorId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Unauthorized: You are not the vendor for this order'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }
    
    // Check that the status change follows a logical progression
    const validTransitions: Record<string, string[]> = {
      'pending': ['accepted', 'cancelled'],
      'accepted': ['preparing', 'cancelled'],
      'preparing': ['ready', 'cancelled'],
      'ready': ['delivering', 'cancelled'],
      'delivering': ['delivered', 'cancelled'],
      'delivered': [], // Terminal state
      'cancelled': []  // Terminal state
    };
    
    if (!validTransitions[orderData.status]?.includes(status) && orderData.status !== status) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Invalid status transition from ${orderData.status} to ${status}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Update order status
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating order status:', updateError);
      return new Response(
        JSON.stringify({
          success: false,
          error: updateError.message
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Create notification for the student
    const notificationMessage = getNotificationMessage(status);
    
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        recipient_id: orderData.student_id,
        type: `order_${status}`,
        message: notificationMessage,
        data: { orderId }
      });

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Continue anyway since the order was updated successfully
    }

    return new Response(
      JSON.stringify({
        success: true,
        order: updatedOrder
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating order status:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Helper function to create notification messages based on status
function getNotificationMessage(status: string): string {
  switch (status) {
    case 'accepted':
      return 'Your order has been accepted by the restaurant';
    case 'preparing':
      return 'The restaurant is now preparing your food';
    case 'ready':
      return 'Your order is ready for delivery';
    case 'delivering':
      return 'Your order is on the way!';
    case 'delivered':
      return 'Your order has been delivered. Enjoy!';
    case 'cancelled':
      return 'We apologize, but your order has been cancelled';
    default:
      return `Your order status has been updated to ${status}`;
  }
}
