-- Clean up existing problematic users and fix constraints
-- Run this in your Supabase SQL Editor

-- First, let's see what problematic users exist
SELECT id, email, first_name, last_name 
FROM users 
WHERE email = '' OR email IS NULL;

-- Delete users with empty emails (they're likely corrupted test data)
DELETE FROM users WHERE email = '';

-- If there are any NULL emails, update them to use a fallback
UPDATE users 
SET email = id || '@clerk.local' 
WHERE email IS NULL;

-- Verify the cleanup
SELECT 'Cleanup complete!' as status, COUNT(*) as total_users FROM users;