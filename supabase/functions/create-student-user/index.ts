
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

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
    
    console.log('SUPABASE_URL available:', !!supabaseUrl);
    console.log('SUPABASE_SERVICE_ROLE_KEY available:', !!supabaseServiceKey);
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing required environment variables');
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    const { phone, name, password, email } = await req.json();
    
    console.log(`Creating new user with phone: ${phone}, name: ${name}, email: ${email}`);
    
    if (!phone || !name || !password || !email) {
      return new Response(
        JSON.stringify({ success: false, error: 'Phone, name, email, and password are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Check if user with this phone or email already exists
    const { data: existingUsers, error: checkError } = await supabaseClient
      .from('student_users')
      .select('*')
      .or(`phone.eq.${phone},email.eq.${email}`);
      
    if (checkError) {
      console.error('Error checking existing user:', checkError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to check if user exists' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    if (existingUsers && existingUsers.length > 0) {
      const existingPhone = existingUsers.some(user => user.phone === phone);
      const existingEmail = existingUsers.some(user => user.email === email);
      
      if (existingPhone && existingEmail) {
        return new Response(
          JSON.stringify({ success: false, error: 'Both phone number and email already registered' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 409 }
        );
      } else if (existingPhone) {
        return new Response(
          JSON.stringify({ success: false, error: 'Phone number already registered' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 409 }
        );
      } else {
        return new Response(
          JSON.stringify({ success: false, error: 'Email already registered' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 409 }
        );
      }
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    
    // Generate a UUID for the student
    const { data: uuidData } = await supabaseClient.rpc('gen_random_uuid');
    const studentId = uuidData;
    
    // Create the user without linking to auth.users
    const { data: newUser, error: insertError } = await supabaseClient
      .from('student_users')
      .insert([
        { id: studentId, phone, name, password_hash, email }
      ])
      .select()
      .single();
      
    if (insertError) {
      console.error('Error creating user:', insertError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create user account' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Return success with the new user ID
    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: newUser.id,
        name: newUser.name,
        email: newUser.email,
        message: 'User created successfully'
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
