
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
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const requestData = await req.json();
    const { phone, name, password, email } = requestData;
    
    if (!phone || !name || !password || !email) {
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
      console.error('Error checking if user exists:', checkError);
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
    
    // Hash the password securely
    const encoder = new TextEncoder();
    const passwordBytes = encoder.encode(password);
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const hashBuffer = await crypto.subtle.digest(
      'SHA-256', 
      new Uint8Array([...salt, ...passwordBytes])
    );
    
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const saltArray = Array.from(salt);
    const password_hash = `${saltArray.map(b => b.toString(16).padStart(2, '0')).join('')}:${hashArray.map(b => b.toString(16).padStart(2, '0')).join('')}`;
    
    // Generate a UUID for the student
    const studentId = crypto.randomUUID();
    
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
    
    // Return success with the new user ID and a message to log in
    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: newUser.id,
        name: newUser.name,
        email: newUser.email,
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
