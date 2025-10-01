// Test script to verify Clerk and Supabase setup
// Run with: node test-setup.js

const fs = require('fs');
const path = require('path');

// Load environment variables
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    if (line && !line.startsWith('#') && line.includes('=')) {
      const [key, ...valueParts] = line.split('=');
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });

  console.log('🔍 CHECKING YOUR CONFIGURATION...\n');
  console.log('=' .repeat(50));

  // Check Clerk configuration
  console.log('\n📌 CLERK AUTHENTICATION:');
  console.log('-'.repeat(30));
  
  const clerkKey = envVars.VITE_CLERK_PUBLISHABLE_KEY;
  if (!clerkKey || clerkKey === 'your_key_here') {
    console.log('❌ Clerk is NOT configured');
    console.log('   → You need to add your Clerk publishable key');
    console.log('   → Get it from: https://dashboard.clerk.com');
  } else if (clerkKey.startsWith('pk_test_') || clerkKey.startsWith('pk_live_')) {
    console.log('✅ Clerk key is properly configured');
    console.log(`   → Key type: ${clerkKey.startsWith('pk_test_') ? 'Test' : 'Live'} environment`);
  } else {
    console.log('⚠️  Clerk key format looks unusual');
    console.log('   → Make sure it starts with pk_test_ or pk_live_');
  }

  // Check Supabase configuration
  console.log('\n🗄️  SUPABASE DATABASE:');
  console.log('-'.repeat(30));
  
  const supabaseUrl = envVars.VITE_SUPABASE_URL;
  const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url_here') {
    console.log('❌ Supabase URL is NOT configured');
    console.log('   → You need to add your Supabase project URL');
    console.log('   → Get it from: https://supabase.com → Settings → API');
  } else if (supabaseUrl.includes('.supabase.co')) {
    console.log('✅ Supabase URL is properly configured');
    const projectId = supabaseUrl.split('//')[1]?.split('.')[0];
    console.log(`   → Project ID: ${projectId}`);
  } else {
    console.log('⚠️  Supabase URL format looks unusual');
    console.log('   → Should be like: https://xyz.supabase.co');
  }

  if (!supabaseKey || supabaseKey === 'your_supabase_anon_key_here') {
    console.log('❌ Supabase anon key is NOT configured');
    console.log('   → You need to add your Supabase anon key');
    console.log('   → Get it from: https://supabase.com → Settings → API');
  } else if (supabaseKey.startsWith('eyJ')) {
    console.log('✅ Supabase anon key is properly configured');
    console.log(`   → Key length: ${supabaseKey.length} characters`);
  } else {
    console.log('⚠️  Supabase key format looks unusual');
    console.log('   → Should be a JWT token starting with "eyJ"');
  }

  // Check integration status
  console.log('\n🔗 INTEGRATION STATUS:');
  console.log('-'.repeat(30));
  
  const clerkConfigured = clerkKey && clerkKey !== 'your_key_here';
  const supabaseConfigured = supabaseUrl && supabaseUrl !== 'your_supabase_project_url_here' && 
                             supabaseKey && supabaseKey !== 'your_supabase_anon_key_here';

  if (clerkConfigured && supabaseConfigured) {
    console.log('✅ BOTH services are configured and ready!');
    console.log('\n📋 How the integration works:');
    console.log('   1. Clerk handles all authentication (login/signup)');
    console.log('   2. When a user signs up via Clerk, their Clerk ID is used');
    console.log('   3. Supabase stores user profile data using the Clerk ID');
    console.log('   4. The app syncs Clerk auth with Supabase data storage');
    
    console.log('\n🚀 Next steps:');
    console.log('   1. Make sure you ran the schema.sql in Supabase SQL Editor');
    console.log('   2. Start the dev server: npm run dev');
    console.log('   3. Test the signup flow to verify everything works');
  } else {
    console.log('❌ Services are NOT fully configured');
    
    if (!clerkConfigured && !supabaseConfigured) {
      console.log('\n📝 You need to configure BOTH Clerk and Supabase:');
      console.log('   1. Get Clerk key from: https://dashboard.clerk.com');
      console.log('   2. Get Supabase credentials from: https://supabase.com');
      console.log('   3. Update the .env.local file with actual values');
    } else if (!clerkConfigured) {
      console.log('\n📝 You still need to configure Clerk:');
      console.log('   1. Go to https://dashboard.clerk.com');
      console.log('   2. Create an application or use existing one');
      console.log('   3. Copy the publishable key');
      console.log('   4. Update VITE_CLERK_PUBLISHABLE_KEY in .env.local');
    } else if (!supabaseConfigured) {
      console.log('\n📝 You still need to configure Supabase:');
      console.log('   1. Go to https://supabase.com');
      console.log('   2. Create a project or use existing one');
      console.log('   3. Go to Settings → API');
      console.log('   4. Copy the project URL and anon key');
      console.log('   5. Update VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('Check complete!\n');

} else {
  console.log('❌ ERROR: .env.local file not found!');
  console.log('   Create it in the project root directory');
}