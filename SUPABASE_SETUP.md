# Supabase Setup Guide for Smart Student Hub

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click **"New Project"**
4. Choose your organization
5. Fill in project details:
   - **Name**: `smart-student-hub`
   - **Database Password**: Choose a strong password (save it securely)
   - **Region**: Choose the closest region to your users
6. Click **"Create new project"**
7. Wait for the project to be set up (takes 1-2 minutes)

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (something like `https://abc123def.supabase.co`)
   - **anon/public key** (starts with `eyJhbGciOi...`)

## 3. Update Environment Variables

Replace the placeholder values in your `.env.local` file:

```bash
# Replace these with your actual Supabase values
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## 4. Set Up the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Copy and paste the entire content from `database/schema.sql`
4. Click **"Run"** to execute the SQL
5. You should see "Success. No rows returned" message

## 5. Configure Authentication (Important!)

Since we're using Clerk for authentication and Supabase for data storage, we need to configure Supabase to accept Clerk user IDs:

1. Go to **Authentication** → **Settings** in your Supabase dashboard
2. Under **Auth Providers**, disable all providers (we'll use Clerk instead)
3. Go to **Database** → **Extensions**
4. Make sure **uuid-ossp** extension is enabled

## 6. Test the Integration

1. Start your development server: `npm run dev`
2. Go to `http://localhost:3000`
3. Try the signup flow with the new Supabase integration
4. Check the **Table Editor** in Supabase to see if user data is being stored

## 7. Verify Database Tables

In Supabase **Table Editor**, you should see:
- **users** table - for storing user profiles
- **activities** table - for storing student activities

## Security Features Included

✅ **Row Level Security (RLS)** - Users can only access their own data
✅ **Role-based Access** - Admins can view all users, students only see their data
✅ **Automatic Timestamps** - created_at and updated_at fields
✅ **Data Validation** - Proper constraints and checks

## Next Steps

Once Supabase is configured:
1. Test user registration and login
2. Verify that user names and roles display correctly
3. Test the complete application flow
4. Add any additional features as needed

## Troubleshooting

**Connection Issues:**
- Verify your Supabase URL and anon key are correct
- Check that your `.env.local` file is in the project root
- Restart your development server after updating environment variables

**Database Issues:**
- Ensure the schema.sql was executed successfully
- Check the Supabase logs for any errors
- Verify RLS policies are working correctly

**Authentication Issues:**
- Make sure Clerk is still working for authentication
- Supabase will only handle data storage, not authentication
- User IDs should match between Clerk and Supabase