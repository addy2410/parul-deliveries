
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase URL or service key');
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const requestData = await req.json();
    const { email, password } = requestData;
    
    if (!email || !password) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email and password are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    console.log(`Attempting to sign in user with email: ${email}`);
    
    // Sign in the user with Supabase Auth
    const { data: authData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });
    
    if (signInError) {
      console.error('Auth sign in error:', signInError);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid email or password' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }
    
    if (!authData.user) {
      console.error('Sign in returned no user');
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid email or password' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }
    
    console.log(`User authenticated successfully: ${authData.user.id}`);
    
    // Get the student details from student_users table
    const { data: student, error: fetchError } = await supabaseAdmin
      .from('student_users')
      .select('id, name, email, phone')
      .eq('id', authData.user.id)
      .single();
      
    if (fetchError) {
      console.error('Error fetching student data:', fetchError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch student data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    if (!student) {
      console.error('No student profile found for authenticated user');
      return new Response(
        JSON.stringify({ success: false, error: 'Student profile not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }
    
    console.log('Student data found, returning success response');
    
    // Return success with the student information
    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: student.id,
        name: student.name,
        email: student.email,
        phone: student.phone
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
