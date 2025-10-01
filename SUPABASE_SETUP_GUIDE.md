# 🚀 Supabase Setup Guide - Step by Step

Follow these steps carefully to set up Supabase for your Smart Student Hub project.

## 📝 Step 1: Create a Supabase Account

1. **Open your browser** and go to: https://supabase.com
2. Click the **"Start your project"** button
3. You can sign up using:
   - GitHub (recommended - fastest)
   - Email and password
4. Verify your email if you signed up with email

## 🏗️ Step 2: Create Your Project

Once logged in:

1. Click **"New project"** button (usually green)
2. Fill in the project details:
   - **Organization**: Select your organization or create one
   - **Project name**: `smart-student-hub` (or any name you prefer)
   - **Database Password**: 
     - Choose a STRONG password (minimum 6 characters)
     - ⚠️ **SAVE THIS PASSWORD** - you might need it later
     - Example: `MyStr0ng!Pass2024`
   - **Region**: Choose the closest to you for best performance
     - For USA: East US (Northern Virginia)
     - For Europe: West EU (Ireland)
     - For Asia: Southeast Asia (Singapore)
   - **Pricing Plan**: Free tier is perfect for this project

3. Click **"Create new project"**
4. **WAIT** - Project creation takes about 1-2 minutes
   - You'll see a loading screen with fun facts
   - Don't close the browser!

## 🔑 Step 3: Get Your API Credentials

Once your project is created:

1. You'll land on the project dashboard
2. Look at the left sidebar and click **"Settings"** (gear icon)
3. Under Settings, click **"API"**
4. You'll see several important values. You need these two:

### Project URL
- Look for **"Project URL"**
- It looks like: `https://abcdefghijklmnop.supabase.co`
- Click the **copy** button next to it

### Anon/Public Key
- Look for **"anon public"** key (NOT the service_role key!)
- It's a long string starting with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Click the **copy** button next to it

## 📄 Step 4: Update Your Local Environment File

1. Open your `.env.local` file in a text editor
2. Replace the placeholder values:

```env
# Before (placeholders):
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# After (with your actual values):
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNDU2Nzg5MCwiZXhwIjoxOTUwMTQzODkwfQ.1234567890abcdefghijklmnopqrstuvwxyz
```

3. **SAVE** the file

## 🗄️ Step 5: Set Up Your Database Tables

Now we need to create the database structure:

1. Go back to your Supabase dashboard
2. In the left sidebar, click **"SQL Editor"** (looks like: </>)
3. Click the **"+ New query"** button (usually green)
4. **DELETE** any default text in the editor
5. Copy ALL the SQL code from your `database/schema.sql` file
6. Paste it into the SQL editor
7. Click the **"Run"** button (green play button) at the bottom right
8. You should see:
   - ✅ "Success. No rows returned"
   - This means your tables were created successfully!

## ✅ Step 6: Verify Your Setup

### Check Tables Were Created:
1. In the left sidebar, click **"Table Editor"**
2. You should see two tables:
   - `users` - for storing user profiles
   - `activities` - for storing student activities
3. Click on each table to verify they exist (they'll be empty, that's normal)

### Check Database Policies:
1. Still in Table Editor, click on the `users` table
2. Look for **"RLS enabled"** badge - it should be there
3. This means Row Level Security is active (good for data protection!)

## 🔧 Step 7: Configure Authentication Settings

Since we're using Clerk for authentication:

1. In the left sidebar, click **"Authentication"**
2. Click on **"Providers"** tab
3. **IMPORTANT**: Make sure ALL providers are disabled
   - We don't need them since Clerk handles authentication
   - Email, Google, GitHub, etc. should all be OFF

## 🎯 Step 8: Test Your Configuration

Run the test script to verify Supabase is configured:

```bash
node test-setup.js
```

You should now see:
- ✅ Supabase URL is properly configured
- ✅ Supabase anon key is properly configured

## ❓ Troubleshooting

### If SQL execution fails:
- Make sure you copied the ENTIRE schema.sql content
- Check for any error messages in red
- Try running the SQL in smaller chunks

### If you can't find the API keys:
- Make sure you're in Settings → API
- Don't use the "service_role" key (that's for backend only)
- Use the "anon public" key

### If tables don't appear:
- Refresh the page
- Check SQL Editor → History to see if the query ran
- Look for any error messages

## 📌 Important Notes

1. **Keep your credentials safe** - Never share them publicly
2. **Free tier limits**: 
   - 500MB database
   - 1GB file storage
   - 2GB bandwidth
   - More than enough for development!
3. **The anon key is safe to use in frontend** - it's designed for that
4. **Don't delete your project** - You only get 2 free projects

## 🎉 Success Checklist

- [ ] Created Supabase account
- [ ] Created project with strong password
- [ ] Copied Project URL
- [ ] Copied anon/public key
- [ ] Updated .env.local file
- [ ] Ran SQL to create tables
- [ ] Verified tables exist
- [ ] Disabled all auth providers
- [ ] Test script shows Supabase ✅

Once all items are checked, Supabase is ready! Next, you'll need to set up Clerk.