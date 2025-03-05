
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
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log("Environment variables loaded:", {
      urlPresent: !!supabaseUrl,
      keyPresent: !!supabaseKey
    });
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase credentials");
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Parse request body with error handling
    let requestData;
    try {
      console.log("Attempting to parse request body");
      requestData = await req.json();
      console.log("Request body parsed successfully:", requestData);
    } catch (parseError) {
      console.error("Failed to parse request JSON:", parseError);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid request format' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    const { email, name, password } = requestData;
    
    // Validate required fields
    if (!email || !name || !password) {
      const missingFields = [];
      if (!email) missingFields.push('email');
      if (!name) missingFields.push('name');
      if (!password) missingFields.push('password');
      
      console.error(`Missing required fields: ${missingFields.join(', ')}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    console.log(`Attempting to create new student user. Name: ${name}, Email: ${email}`);
    
    // Validate password length
    if (password.length < 6) {
      console.error("Password too short");
      return new Response(
        JSON.stringify({ success: false, error: 'Password must be at least 6 characters long' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    // Check if user with this email already exists in student_users
    console.log("Checking if email already exists in student_users");
    const { data: existingStudents, error: checkStudentError } = await supabaseClient
      .from('student_users')
      .select('email')
      .eq('email', email);
      
    if (checkStudentError) {
      console.error('Error checking existing student:', checkStudentError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to check if student exists' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    if (existingStudents && existingStudents.length > 0) {
      console.error('Email already registered as student');
      return new Response(
        JSON.stringify({ success: false, error: 'Email already registered' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    // Check if this email is used by a vendor
    console.log("Checking if email already exists in vendors");
    const { data: existingVendors, error: checkVendorError } = await supabaseClient
      .from('vendors')
      .select('email')
      .eq('email', email);
      
    if (checkVendorError) {
      console.error('Error checking existing vendor:', checkVendorError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to check if email is used by a vendor' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    if (existingVendors && existingVendors.length > 0) {
      console.error('Email already registered as vendor');
      return new Response(
        JSON.stringify({ success: false, error: 'Email already registered as a vendor' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    // Generate a UUID for the user
    let userId;
    try {
      userId = crypto.randomUUID();
      console.log("Generated user ID:", userId);
    } catch (uuidError) {
      console.error('Error generating UUID:', uuidError);
      return new Response(
        JSON.stringify({ success: false, error: 'User ID generation failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    // Hash the password - FIXED THIS SECTION for better error handling
    let password_hash;
    try {
      console.log("Hashing password");
      // Using a simpler method to generate salt and hash password
      password_hash = await bcrypt.hash(password);
      console.log("Password hashed successfully");
    } catch (hashError) {
      console.error('Error hashing password:', hashError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Password processing failed', 
          details: hashError.message || 'Unknown hashing error'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    if (!password_hash) {
      console.error('Password hash is null or undefined');
      return new Response(
        JSON.stringify({ success: false, error: 'Password hash generation failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    // Create the user with a default phone number
    console.log("Inserting new student user with ID:", userId);
    try {
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
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
      
      console.log("Insert operation completed, checking results");
      if (!newUser || newUser.length === 0) {
        console.error('User created but no data returned');
        
        // Double-check if the user was actually created
        console.log("Double-checking if user was created");
        const { data: checkUser, error: checkError } = await supabaseClient
          .from('student_users')
          .select('id, name, email')
          .eq('email', email)
          .maybeSingle();
          
        if (checkError) {
          console.error('Error checking if user was created:', checkError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to verify user creation: ' + checkError.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          );
        }
        
        if (checkUser) {
          console.log("Found user after creation:", checkUser);
          return new Response(
            JSON.stringify({ 
              success: true, 
              userId: checkUser.id,
              name: checkUser.name,
              message: 'User created successfully'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          );
        }
        
        return new Response(
          JSON.stringify({ success: false, error: 'User creation failed with unknown error' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
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
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    } catch (dbError) {
      console.error('Database operation error:', dbError);
      return new Response(
        JSON.stringify({ success: false, error: 'Database operation failed: ' + dbError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
  } catch (error) {
    console.error('Edge function error:', error);
    // Always return status 200 with error in body
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown server error',
        stack: error.stack 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});
