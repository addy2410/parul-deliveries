
// This edge function cleans up stale orders
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment variables SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    console.log('Starting stale orders cleanup process')
    
    // Set cutoff time to 2 hours ago
    const twoHoursAgo = new Date()
    twoHoursAgo.setHours(twoHoursAgo.getHours() - 2)
    const cutoffTime = twoHoursAgo.toISOString()
    
    console.log(`Cleaning up orders created before: ${cutoffTime}`)
    
    // Update stale orders to delivered status
    const { data, error, count } = await supabase
      .from('orders')
      .update({ 
        status: 'delivered',
        updated_at: new Date().toISOString()
      })
      .lt('created_at', cutoffTime)
      .in('status', ['pending', 'preparing', 'prepared'])
      .select('id')
    
    if (error) {
      throw error
    }
    
    const cleanedOrderIds = data?.map(order => order.id) || []
    console.log(`Cleaned up ${cleanedOrderIds.length} stale orders`)
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully updated ${cleanedOrderIds.length} stale orders to 'delivered' status`,
        cleaned_orders: cleanedOrderIds
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    )
  } catch (error) {
    console.error('Error in cleanup-stale-orders function:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    )
  }
})
