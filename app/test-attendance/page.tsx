"use client";

import { useState } from 'react';

export default function TestAttendancePage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testCreateRequest = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_request',
          worker_id: 'test-worker-123',
          worker_name: 'Test Worker',
          worker_email: 'test@example.com',
          location_lat: 19.213585,
          location_lng: 72.865429,
          is_within_zone: true
        }),
      });

      const data = await response.json();
      setResult({ type: 'create', status: response.status, data });
    } catch (error) {
      setResult({ type: 'create', error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testFetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/attendance?type=requests');
      const data = await response.json();
      setResult({ type: 'fetch', status: response.status, data });
    } catch (error) {
      setResult({ type: 'fetch', error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Test Attendance API</h1>
        
        <div className="space-y-4">
          <button
            onClick={testCreateRequest}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Create Test Request'}
          </button>
          
          <button
            onClick={testFetchRequests}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 ml-4"
          >
            {loading ? 'Loading...' : 'Fetch Requests'}
          </button>
        </div>
        
        {result && (
          <div className="mt-6 p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2">Result:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="mt-6">
          <a href="/" className="text-blue-600 hover:underline">← Back to Home</a>
        </div>
      </div>
    </div>
  );
}