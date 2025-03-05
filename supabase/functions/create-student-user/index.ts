
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
    
    console.log('Creating student user - initialization');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing required environment variables');
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const requestData = await req.json();
    const { phone, name, password, email } = requestData;
    
    console.log(`Creating new user with name: ${name}, email: ${email}`);
    
    if (!phone || !name || !password || !email) {
      console.error('Missing required fields in request');
      return new Response(
        JSON.stringify({ success: false, error: 'Phone, name, email, and password are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Check if user with this phone or email already exists
    const { data: existingUsers, error: checkError } = await supabaseClient
      .from('student_users')
      .select('phone, email')
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
    
    // Hash the password with bcrypt
    let password_hash;
    try {
      password_hash = await bcrypt.hash(password);
      console.log('Password hashed successfully');
    } catch (bcryptError) {
      console.error('Bcrypt hashing error:', bcryptError);
      return new Response(
        JSON.stringify({ success: false, error: 'Password hashing failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Generate a UUID for the student
    const { data: studentId, error: uuidError } = await supabaseClient.rpc('gen_random_uuid');
    
    if (uuidError) {
      console.error('Error generating UUID:', uuidError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to generate user ID' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    console.log('Generated UUID:', studentId);
    
    // Create the user
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
        JSON.stringify({ success: false, error: 'Failed to create user account', details: insertError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    console.log('User created successfully:', newUser.id);
    
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
