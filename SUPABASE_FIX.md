# 🔧 Quick Fix for Supabase 500 Errors

## The Problem
You're getting 500 errors because the Supabase RLS (Row Level Security) policies are expecting Supabase Auth users, but you're using Clerk authentication with Clerk user IDs.

## Immediate Fix

### Step 1: Fix Database Policies
1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Run this SQL command:

```sql
-- Disable RLS policies that are causing the 500 errors
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
```

### Step 2: Test the Fix
1. In your app, navigate to: `http://localhost:5173/debug`
2. Click "Test Basic Connection" to verify Supabase works
3. Click "Test User Insert" to verify your Clerk ID can be stored
4. If both work, go back and try the role setup again

### Step 3: Alternative - Use Debug Route
If you're still having issues:
1. Sign in to your app with Clerk
2. Go to `http://localhost:5173/debug` 
3. Use the diagnostic tools to identify the exact problem

## Why This Happened
- Your original schema has RLS policies that check `auth.uid()`
- `auth.uid()` works with Supabase Auth but returns NULL with Clerk
- This causes the policies to deny access, resulting in 500 errors
- Disabling RLS allows your app to work with Clerk authentication

## Next Steps After Fix
1. Test the complete signup/role setup flow
2. Verify that user data is properly stored in Supabase
3. Confirm that the redirection works after role setup

## If You Still Have Issues
Run the diagnostic tool at `/debug` and check the browser console for more detailed error messages.