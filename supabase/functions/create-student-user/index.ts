
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
    const { phone, name, password, email } = requestData;
    
    if (!phone || !name || !password || !email) {
      return new Response(
        JSON.stringify({ success: false, error: 'Phone, name, email, and password are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    console.log(`Attempting to create student with email: ${email}`);
    
    // First, create the auth user via Supabase Auth API
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name,
        phone,
        type: 'student'
      }
    });
    
    if (authError) {
      console.error('Error creating auth user:', authError);
      
      if (authError.message.includes('already registered')) {
        return new Response(
          JSON.stringify({ success: false, error: 'Email already registered' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 409 }
        );
      }
      
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create user account', details: authError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    if (!authUser.user) {
      console.error('Auth user creation returned no user');
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create user account' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    console.log(`Auth user created with ID: ${authUser.user.id}`);
    
    // Create the student_users record linked to the auth user
    const { data: studentUser, error: studentError } = await supabaseAdmin
      .from('student_users')
      .insert([
        { 
          id: authUser.user.id, 
          phone, 
          name, 
          email
        }
      ])
      .select()
      .single();
      
    if (studentError) {
      console.error('Error creating student_users record:', studentError);
      
      // Clean up if student_users creation fails by deleting the auth user
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create student profile', details: studentError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    console.log('Student user created successfully');
    
    // Return success with the new user information
    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: authUser.user.id,
        name: name,
        email: email,
        message: 'Registration successful. Please log in to continue.'
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
