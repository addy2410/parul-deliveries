
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
    
    console.log('Verifying student password - starting authentication');
    
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
    const { email, password } = requestData;
    
    console.log(`Attempting to verify password for email: ${email}`);
    
    if (!email || !password) {
      console.error('Missing email or password in request');
      return new Response(
        JSON.stringify({ success: false, error: 'Email and password are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Get the user with the email
    const { data: student, error: fetchError } = await supabaseClient
      .from('student_users')
      .select('id, password_hash, name, email')
      .eq('email', email)
      .maybeSingle();
      
    if (fetchError) {
      console.error('Error fetching student:', fetchError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch user data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    if (!student) {
      console.log('User not found for email:', email);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid email or password' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }
    
    console.log('Found student with ID:', student.id);
    
    try {
      // Verify the password using the same approach as in create-student-user
      const passwordHash = student.password_hash;
      
      // Split the stored hash into salt and hash
      const [storedSaltHex, storedHashHex] = passwordHash.split(':');
      
      if (!storedSaltHex || !storedHashHex) {
        console.error('Invalid password hash format');
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid password hash format' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      // Convert hex string to Uint8Array
      const storedSalt = new Uint8Array(storedSaltHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
      
      // Hash the provided password with the stored salt
      const encoder = new TextEncoder();
      const passwordBytes = encoder.encode(password);
      
      // Generate the hash with the same salt
      const hashBuffer = await crypto.subtle.digest(
        'SHA-256',
        new Uint8Array([...storedSalt, ...passwordBytes])
      );
      
      // Convert to hex for comparison
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const calculatedHashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      // Compare the hashes
      const passwordMatches = calculatedHashHex === storedHashHex;
      
      console.log('Password verification result:', passwordMatches);
      
      if (!passwordMatches) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid email or password' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }
      
      // Return success with the user information
      return new Response(
        JSON.stringify({ 
          success: true, 
          userId: student.id,
          name: student.name,
          email: student.email
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (verificationError) {
      console.error('Password verification error:', verificationError);
      return new Response(
        JSON.stringify({ success: false, error: 'Password verification failed', details: verificationError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
