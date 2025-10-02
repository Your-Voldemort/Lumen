import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@clerk/clerk-react';

export function QuickSupabaseFix() {
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { user: clerkUser } = useUser();

  const testBasicConnection = async () => {
    setIsLoading(true);
    setResult('Testing basic Supabase connection...');

    try {
      // Test if we can connect at all
      const { data, error } = await supabase
        .from('users')
        .select('count', { count: 'exact', head: true });

      if (error) {
        setResult(`❌ Connection failed: ${error.message}\nCode: ${error.code}\nDetails: ${error.details || 'None'}`);
      } else {
        setResult(`✅ Basic connection works! User table exists.`);
      }
    } catch (err) {
      setResult(`❌ Connection error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    setIsLoading(false);
  };

  const disableRLS = async () => {
    setIsLoading(true);
    setResult('Attempting to disable RLS policies...');

    try {
      // Try to disable RLS - this might fail if user doesn't have permissions
      const { error: rlsError1 } = await supabase.rpc('sql', { 
        query: 'ALTER TABLE users DISABLE ROW LEVEL SECURITY;' 
      });
      
      const { error: rlsError2 } = await supabase.rpc('sql', { 
        query: 'ALTER TABLE activities DISABLE ROW LEVEL SECURITY;' 
      });

      if (rlsError1 || rlsError2) {
        setResult(`⚠️ Could not disable RLS programmatically. You need to run this in Supabase SQL Editor:\n\nALTER TABLE users DISABLE ROW LEVEL SECURITY;\nALTER TABLE activities DISABLE ROW LEVEL SECURITY;`);
      } else {
        setResult(`✅ RLS disabled successfully! Try the app again.`);
      }
    } catch (err) {
      setResult(`⚠️ Need to run SQL manually. Copy this into your Supabase SQL Editor:\n\nALTER TABLE users DISABLE ROW LEVEL SECURITY;\nALTER TABLE activities DISABLE ROW LEVEL SECURITY;\n\nThen refresh the app.`);
    }

    setIsLoading(false);
  };

  const testUserInsert = async () => {
    if (!clerkUser) {
      setResult('❌ No Clerk user found. Please sign in first.');
      return;
    }

    setIsLoading(true);
    setResult('Testing user insert with your Clerk ID...');

    try {
      const testUser = {
        id: clerkUser.id,
        email: clerkUser.emailAddresses?.[0]?.emailAddress || 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'student' as const,
        department: 'Test Department'
      };

      console.log('Inserting test user:', testUser);

      const { data, error } = await supabase
        .from('users')
        .upsert([testUser])
        .select()
        .single();

      if (error) {
        setResult(`❌ Insert failed: ${error.message}\nCode: ${error.code}\nDetails: ${error.details || 'None'}\nHint: ${error.hint || 'None'}`);
      } else {
        setResult(`✅ Insert successful! User created: ${JSON.stringify(data, null, 2)}\n\nNow try the role setup again!`);
      }
    } catch (err) {
      setResult(`❌ Insert error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-red-50 to-orange-100">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle>🔧 Supabase Connection Fixer</CardTitle>
          <CardDescription>
            Let's diagnose and fix your Supabase connection issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-2">
            <Button 
              onClick={testBasicConnection}
              disabled={isLoading}
              variant="outline"
            >
              1. Test Basic Connection
            </Button>
            <Button 
              onClick={disableRLS}
              disabled={isLoading}
              variant="outline"
            >
              2. Fix RLS Policies
            </Button>
            <Button 
              onClick={testUserInsert}
              disabled={isLoading || !clerkUser}
              variant="outline"
            >
              3. Test User Insert
            </Button>
          </div>
          
          {result && (
            <div className="p-4 bg-muted rounded-lg">
              <pre className="text-sm whitespace-pre-wrap">{result}</pre>
            </div>
          )}

          <div className="space-y-2 text-sm">
            <h4 className="font-medium">Current Status:</h4>
            <div className="space-y-1 text-muted-foreground">
              <div>Supabase URL: {import.meta.env.VITE_SUPABASE_URL ? '✓ Set' : '✗ Missing'}</div>
              <div>Supabase Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing'}</div>
              <div>Clerk User: {clerkUser ? `✓ ${clerkUser.id}` : '✗ Not signed in'}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}