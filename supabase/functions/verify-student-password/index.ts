
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

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const requestData = await req.json();
    const { email, password } = requestData;
    
    if (!email || !password) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email and password are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    console.log(`Verifying password for email: ${email}`);
    
    // Get the user with the email
    const { data: student, error: fetchError } = await supabaseClient
      .from('student_users')
      .select('id, password_hash, name, email')
      .eq('email', email)
      .maybeSingle();
      
    if (fetchError) {
      console.error('Error fetching user:', fetchError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch user data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    if (!student) {
      console.log('No student found with this email');
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid email or password' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }
    
    try {
      // Verify the password
      const passwordHash = student.password_hash;
      
      if (!passwordHash) {
        console.error('Password hash is missing');
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid account data' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
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
      
      if (!passwordMatches) {
        console.log('Password verification failed');
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid email or password' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }
      
      console.log('Password verified successfully');
      
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
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
