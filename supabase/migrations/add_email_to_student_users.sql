
-- Add email column to student_users table if it doesn't exist
ALTER TABLE student_users 
ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

-- Remove password_hash column if we're using Supabase Auth
ALTER TABLE student_users 
DROP COLUMN IF EXISTS password_hash;

-- Update student_users to link with auth.users
ALTER TABLE student_users 
ADD CONSTRAINT IF NOT EXISTS student_users_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
