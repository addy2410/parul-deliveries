
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import * as bcrypt from "https://esm.sh/bcryptjs@2.4.3";

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
    console.log("Starting verify-student-password function");
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase credentials");
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    let requestData;
    try {
      requestData = await req.json();
      console.log(`Attempting to verify password for email: ${requestData.email}`);
    } catch (parseError) {
      console.error("Failed to parse request JSON:", parseError);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid request format' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const { email, password } = requestData;
    
    if (!email || !password) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email and password are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    // Enhanced password validation
    if (typeof password !== 'string') {
      console.error("Password is not a string");
      return new Response(
        JSON.stringify({ success: false, error: 'Password must be a string' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    // Get the user with the email
    const { data: student, error: fetchError } = await supabaseClient
      .from('student_users')
      .select('id, password_hash, name')
      .eq('email', email)
      .maybeSingle();
      
    if (fetchError) {
      console.error('Error fetching student:', fetchError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch user data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    if (!student) {
      return new Response(
        JSON.stringify({ success: false, error: 'User not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    if (!student.password_hash) {
      console.error('Student account has no password hash');
      return new Response(
        JSON.stringify({ success: false, error: 'Account password not set properly' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    // Verify the password with bcryptjs
    try {
      console.log("Comparing password with stored hash");
      
      if (typeof student.password_hash !== 'string') {
        throw new Error("Stored password hash is not a string");
      }
      
      const passwordMatches = await bcrypt.compare(password, student.password_hash);
      console.log("Password comparison result:", passwordMatches);
      
      if (!passwordMatches) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid credentials' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
      
      // Password is correct
      return new Response(
        JSON.stringify({ 
          success: true, 
          userId: student.id,
          name: student.name
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    } catch (bcryptError) {
      console.error('Error in password comparison:', bcryptError);
      console.error('Error details:', bcryptError.message || 'No error message');
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Error verifying password',
          details: "Password verification failed. Please try again."
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
  } catch (error) {
    console.error('Edge function error:', error);
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
