
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
    console.log("Starting create-student-user function");
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase credentials");
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    let requestData;
    try {
      requestData = await req.json();
    } catch (parseError) {
      console.error("Failed to parse request JSON:", parseError);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid request format' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    const { email, name, password } = requestData;
    
    console.log(`Attempting to create new student user with email: ${email}`);
    
    if (!email || !name || !password) {
      console.error("Missing required fields:", { email: !!email, name: !!name, password: !!password });
      return new Response(
        JSON.stringify({ success: false, error: 'Email, name, and password are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    if (password.length < 6) {
      console.error("Password too short");
      return new Response(
        JSON.stringify({ success: false, error: 'Password must be at least 6 characters long' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Check if user with this email already exists in student_users
    const { data: existingStudents, error: checkStudentError } = await supabaseClient
      .from('student_users')
      .select('email')
      .eq('email', email);
      
    if (checkStudentError) {
      console.error('Error checking existing student:', checkStudentError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to check if student exists' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    if (existingStudents && existingStudents.length > 0) {
      console.error('Email already registered as student');
      return new Response(
        JSON.stringify({ success: false, error: 'Email already registered' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 409 }
      );
    }
    
    // Check if this email is used by a vendor
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
      console.error('Email already registered as vendor');
      return new Response(
        JSON.stringify({ success: false, error: 'Email already registered as a vendor' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 409 }
      );
    }
    
    try {
      // Hash the password
      console.log("Hashing password");
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);
      
      // Generate a proper UUID for the user
      const userId = crypto.randomUUID();
      console.log("Generated user ID:", userId);
      
      // Create the user with a default phone number
      console.log("Inserting new student user");
      const { data: newUser, error: insertError } = await supabaseClient
        .from('student_users')
        .insert([
          { 
            id: userId,
            email, 
            name, 
            password_hash, 
            phone: '1234567890' 
          }
        ])
        .select();
        
      if (insertError) {
        console.error('Error creating user:', insertError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to create user account: ' + insertError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      console.log("Insert operation completed, checking results");
      if (!newUser || newUser.length === 0) {
        console.error('User created but no data returned');
        
        // Double-check if the user was actually created
        const { data: checkUser } = await supabaseClient
          .from('student_users')
          .select('id, name')
          .eq('email', email)
          .maybeSingle();
          
        if (checkUser) {
          console.log("Found user after creation:", checkUser);
          return new Response(
            JSON.stringify({ 
              success: true, 
              userId: checkUser.id,
              name: checkUser.name,
              message: 'User created successfully'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return new Response(
          JSON.stringify({ success: false, error: 'User creation failed with unknown error' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      console.log("Student user created successfully:", newUser[0].id);
      
      // Return success with the new user ID
      return new Response(
        JSON.stringify({ 
          success: true, 
          userId: newUser[0].id,
          name: newUser[0].name,
          message: 'User created successfully'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (hashingError) {
      console.error('Error during password hashing or user creation:', hashingError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create user: ' + hashingError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Unknown server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
