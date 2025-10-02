import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function SupabaseDebug() {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    setTestResult('Testing connection...');

    try {
      // Test basic connection
      const { data, error } = await supabase
        .from('users')
        .select('count', { count: 'exact', head: true });

      if (error) {
        setTestResult(`Connection failed: ${error.message}\nCode: ${error.code}\nDetails: ${error.details}`);
      } else {
        setTestResult(`Connection successful! User count: ${data}`);
      }
    } catch (err) {
      setTestResult(`Connection error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    setIsLoading(false);
  };

  const testInsert = async () => {
    setIsLoading(true);
    setTestResult('Testing insert...');

    try {
      const testUser = {
        id: `test_${Date.now()}`,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'student' as const,
        department: 'Test Department',
        year: '2024',
        student_id: 'TEST001'
      };

      const { data, error } = await supabase
        .from('users')
        .insert([testUser])
        .select()
        .single();

      if (error) {
        setTestResult(`Insert failed: ${error.message}\nCode: ${error.code}\nDetails: ${error.details}`);
      } else {
        setTestResult(`Insert successful! Created user: ${JSON.stringify(data, null, 2)}`);
        
        // Clean up test data
        await supabase.from('users').delete().eq('id', testUser.id);
      }
    } catch (err) {
      setTestResult(`Insert error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    setIsLoading(false);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Supabase Debug Panel</CardTitle>
        <CardDescription>
          Test your Supabase connection and database operations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={testConnection}
            disabled={isLoading}
            variant="outline"
          >
            Test Connection
          </Button>
          <Button 
            onClick={testInsert}
            disabled={isLoading}
            variant="outline"
          >
            Test Insert
          </Button>
        </div>
        
        {testResult && (
          <div className="p-4 bg-muted rounded-lg">
            <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
          </div>
        )}

        <div className="space-y-2 text-sm">
          <h4 className="font-medium">Environment Variables:</h4>
          <div className="space-y-1 text-muted-foreground">
            <div>VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL ? '✓ Set' : '✗ Missing'}</div>
            <div>VITE_SUPABASE_ANON_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}