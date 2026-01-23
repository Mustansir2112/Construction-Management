"use client";

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Debug Information</h1>
        
        <div className="space-y-4">
          <div>
            <strong>Environment:</strong> {process.env.NODE_ENV}
          </div>
          
          <div>
            <strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set'}
          </div>
          
          <div>
            <strong>Supabase Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}
          </div>
          
          <div>
            <strong>Current Time:</strong> {new Date().toLocaleString()}
          </div>
          
          <div>
            <strong>Page Status:</strong> Loaded successfully
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t">
          <h2 className="text-lg font-semibold mb-2">Quick Actions</h2>
          <div className="space-x-4">
            <a href="/" className="text-blue-600 hover:underline">Home</a>
            <a href="/test" className="text-blue-600 hover:underline">Test Page</a>
            <a href="/auth/loginAdmin" className="text-blue-600 hover:underline">Admin Login</a>
            <a href="/auth/loginWorker" className="text-blue-600 hover:underline">Worker Login</a>
          </div>
        </div>
      </div>
    </div>
  );
}