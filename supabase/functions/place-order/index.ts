
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

interface OrderRequest {
  items: OrderItem[];
  restaurantId: string;
  vendorId: string;
  studentId: string;
  studentName: string;
  deliveryLocation: string;
  totalAmount: number;
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
    const requestData: OrderRequest = await req.json();
    const {
      items,
      restaurantId,
      vendorId,
      studentId,
      studentName,
      deliveryLocation,
      totalAmount
    } = requestData;

    console.log('Received order request:', JSON.stringify(requestData, null, 2));

    // Validate request
    if (!items || !items.length || !restaurantId || !vendorId || !studentId || !studentName || !deliveryLocation) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required order information'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Set estimated delivery time (30-45 min by default)
    const estimatedDeliveryTime = '30-45 min';

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        restaurant_id: restaurantId,
        vendor_id: vendorId,
        student_id: studentId,
        student_name: studentName,
        items: items,
        total_amount: totalAmount,
        status: 'pending',
        delivery_location: deliveryLocation,
        estimated_delivery_time: estimatedDeliveryTime
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return new Response(
        JSON.stringify({
          success: false,
          error: orderError.message
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Create notification for vendor
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        recipient_id: vendorId,
        type: 'new_order',
        message: `New order received from ${studentName}`,
        data: { orderId: order.id }
      });

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Continue anyway since the order was created successfully
    }

    return new Response(
      JSON.stringify({
        success: true,
        orderId: order.id,
        estimatedDeliveryTime
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing order:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
