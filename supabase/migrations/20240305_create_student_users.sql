
-- Create student_users table
CREATE TABLE IF NOT EXISTS public.student_users (
  id UUID PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.student_users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access to authenticated users
CREATE POLICY "Allow users to read own data" 
ON public.student_users 
FOR SELECT USING (auth.uid() = id);

-- Create policy to allow users to update their own data
CREATE POLICY "Allow users to update own data" 
ON public.student_users 
FOR UPDATE USING (auth.uid() = id);

-- Create policy to allow users to insert their own data
CREATE POLICY "Allow users to insert own data" 
ON public.student_users 
FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policy to allow service role to access all data (for auth)
CREATE POLICY "Allow service role full access" 
ON public.student_users 
USING (auth.jwt() ->> 'role' = 'service_role');
