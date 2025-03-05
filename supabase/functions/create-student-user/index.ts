
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { phone, name, password, email } = await req.json();
    
    console.log(`Creating new student user with phone: ${phone}, name: ${name}`);
    
    if (!phone || !name || !password) {
      return new Response(
        JSON.stringify({ success: false, error: 'Phone, name, and password are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Check if user with this phone already exists in student_users
    const { data: existingStudents, error: checkStudentError } = await supabaseClient
      .from('student_users')
      .select('phone')
      .eq('phone', phone);
      
    if (checkStudentError) {
      console.error('Error checking existing student:', checkStudentError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to check if student exists' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    if (existingStudents && existingStudents.length > 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Phone number already registered' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 409 }
      );
    }
    
    // If email is provided, check if it's used by a vendor
    if (email) {
      const { data: existingVendors, error: checkVendorError } = await supabaseClient
        .from('vendors')
        .select('email')
        .eq('email', email);
        
      if (checkVendorError) {
        console.error('Error checking existing vendor:', checkVendorError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to check if email is used by a vendor' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      if (existingVendors && existingVendors.length > 0) {
        return new Response(
          JSON.stringify({ success: false, error: 'Email already registered as a vendor' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 409 }
        );
      }
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    
    // Create the user
    const { data: newUser, error: insertError } = await supabaseClient
      .from('student_users')
      .insert([
        { phone, name, password_hash, email }
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
