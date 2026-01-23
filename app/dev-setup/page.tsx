'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export default function DevSetupPage() {
  const [supabaseStatus, setSupabaseStatus] = useState<'checking' | 'configured' | 'missing'>('checking');
  const [envVars, setEnvVars] = useState({
    url: '',
    anonKey: '',
    serviceKey: ''
  });

  useEffect(() => {
    // Check if Supabase is configured
    const checkSupabase = async () => {
      try {
        const response = await fetch('/api/health-check');
        if (response.ok) {
          setSupabaseStatus('configured');
        } else {
          setSupabaseStatus('missing');
        }
      } catch (error) {
        setSupabaseStatus('missing');
      }
    };

    // Get environment variables (client-side check)
    setEnvVars({
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      serviceKey: 'Hidden for security'
    });

    checkSupabase();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Development Setup</h1>
          <p className="text-gray-600 mt-2">Configure your Supabase connection</p>
        </div>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {supabaseStatus === 'checking' && <AlertCircle className="w-5 h-5 text-yellow-500" />}
              {supabaseStatus === 'configured' && <CheckCircle className="w-5 h-5 text-green-500" />}
              {supabaseStatus === 'missing' && <XCircle className="w-5 h-5 text-red-500" />}
              Supabase Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {supabaseStatus === 'checking' && (
              <p className="text-yellow-600">Checking Supabase configuration...</p>
            )}
            {supabaseStatus === 'configured' && (
              <div className="space-y-2">
                <p className="text-green-600">✅ Supabase is properly configured!</p>
                <p className="text-sm text-gray-600">
                  If you're still seeing "loading" on dashboard components, you may need to run the database setup SQL scripts.
                </p>
              </div>
            )}
            {supabaseStatus === 'missing' && (
              <div className="text-red-600">
                <p className="mb-2">❌ Supabase is not configured properly.</p>
                <p className="text-sm">Please follow the setup instructions below.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Database Tables Status */}
        <Card>
          <CardHeader>
            <CardTitle>Database Tables Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 mb-3">
                Required tables for the application to work properly:
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>user_roles</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>profiles</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>attendance_requests</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>daily_attendance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>inventory</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>movements</span>
                </div>
              </div>
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> If dashboard components show "loading" indefinitely, 
                  run the SQL scripts in step 3 below to create these tables.
                </p>
              </div>
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-sm text-red-800">
                  <strong>Common Errors:</strong>
                </p>
                <ul className="text-xs text-red-700 mt-1 space-y-1">
                  <li>• "Could not find the 'full_text' column" → Run fix_database_schema.sql</li>
                  <li>• "Failed to fetch attendance requests" → Run setup_essential_tables.sql</li>
                  <li>• Components stuck loading → Tables don't exist, run setup scripts</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Environment Variables */}
        <Card>
          <CardHeader>
            <CardTitle>Current Environment Variables</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NEXT_PUBLIC_SUPABASE_URL
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-gray-100 rounded text-sm">
                  {envVars.url || 'Not set'}
                </code>
                {envVars.url && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(envVars.url)}
                  >
                    Copy
                  </Button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NEXT_PUBLIC_SUPABASE_ANON_KEY
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-gray-100 rounded text-sm">
                  {envVars.anonKey ? `${envVars.anonKey.substring(0, 20)}...` : 'Not set'}
                </code>
                {envVars.anonKey && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(envVars.anonKey)}
                  >
                    Copy
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-semibold">1. Get Your Supabase Credentials</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Supabase Dashboard</a></li>
                <li>Select your project (or create a new one)</li>
                <li>Navigate to Settings → API</li>
                <li>Copy your Project URL and Anon key</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">2. Update .env.local File</h3>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
                <pre>{`# Replace with your actual values
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}</pre>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">3. Create Database Tables</h3>
              <p className="text-sm text-gray-600 mb-2">
                Run the following SQL scripts in your Supabase SQL Editor:
              </p>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Step 3a: Essential Tables</p>
                  <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
                    <pre>{`-- Copy and run the contents of setup_essential_tables.sql
-- This creates: user_roles, profiles, attendance_requests, 
-- daily_attendance, inventory, movements, dprs tables`}</pre>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() => copyToClipboard(`-- Run this in Supabase SQL Editor
-- File: setup_essential_tables.sql`)}
                  >
                    Copy SQL File Reference
                  </Button>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Step 3b: Schema Fixes (If you have errors)</p>
                  <div className="bg-red-900 text-red-100 p-3 rounded text-xs overflow-x-auto">
                    <pre>{`-- If you get "full_text column not found" or attendance errors:
-- Copy and run the contents of fix_database_schema.sql`}</pre>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() => copyToClipboard(`-- Run this in Supabase SQL Editor
-- File: fix_database_schema.sql`)}
                  >
                    Copy Schema Fix Reference
                  </Button>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Step 3c: Sample Data</p>
                  <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
                    <pre>{`-- Copy and run the contents of add_sample_data.sql
-- This adds sample inventory, movements, DPR and attendance data`}</pre>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() => copyToClipboard(`-- Run this in Supabase SQL Editor
-- File: add_sample_data.sql`)}
                  >
                    Copy SQL File Reference
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">4. Restart Development Server</h3>
              <p className="text-sm text-gray-600">
                After updating the .env.local file and running the SQL scripts, restart your development server:
              </p>
              <code className="block bg-gray-100 p-2 rounded text-sm">npm run dev</code>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Refresh Status
            </Button>
            <Button
              onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
            >
              Open Supabase Dashboard
            </Button>
            <Button
              onClick={() => window.open('/setup_essential_tables.sql', '_blank')}
              variant="outline"
            >
              View Essential Tables SQL
            </Button>
            <Button
              onClick={() => window.open('/add_sample_data.sql', '_blank')}
              variant="outline"
            >
              View Sample Data SQL
            </Button>
            <Button
              onClick={() => window.open('/fix_database_schema.sql', '_blank')}
              variant="outline"
              className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
            >
              View Schema Fix SQL
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}