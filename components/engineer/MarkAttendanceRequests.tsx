'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AttendanceRequest {
  id: string;
  worker_id: string;
  worker_name: string;
  worker_email: string;
  request_date: string;
  request_time: string;
  location_lat: number;
  location_lng: number;
  is_within_zone: boolean;
  status: 'pending' | 'approved' | 'rejected';
}

export default function MarkAttendanceRequests() {
  const [requests, setRequests] = useState<AttendanceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for now - replace with actual Supabase calls
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setRequests([
        {
          id: '1',
          worker_id: 'w1',
          worker_name: 'John Doe',
          worker_email: 'john@example.com',
          request_date: '2024-01-24',
          request_time: '09:15:30',
          location_lat: 28.6139,
          location_lng: 77.2090,
          is_within_zone: true,
          status: 'pending'
        },
        {
          id: '2',
          worker_id: 'w2',
          worker_name: 'Jane Smith',
          worker_email: 'jane@example.com',
          request_date: '2024-01-24',
          request_time: '09:22:15',
          location_lat: 28.6200,
          location_lng: 77.2150,
          is_within_zone: false,
          status: 'pending'
        },
        {
          id: '3',
          worker_id: 'w3',
          worker_name: 'Mike Johnson',
          worker_email: 'mike@example.com',
          request_date: '2024-01-24',
          request_time: '09:18:45',
          location_lat: 28.6135,
          location_lng: 77.2085,
          is_within_zone: true,
          status: 'pending'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleApproveRequest = async (requestId: string, workerId: string, isWithinZone: boolean) => {
    if (!isWithinZone) {
      alert('Cannot approve attendance - worker is not within the designated zone.');
      return;
    }

    try {
      // Here you would call Supabase to:
      // 1. Update the request status to 'approved'
      // 2. Add the worker to today's attendance record
      
      setRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'approved' as const }
            : req
        )
      );
      
      console.log(`Approved attendance for worker ${workerId}`);
      alert('Attendance approved successfully!');
    } catch (error) {
      console.error('Error approving attendance:', error);
      alert('Failed to approve attendance. Please try again.');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      // Here you would call Supabase to update the request status to 'rejected'
      
      setRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'rejected' as const }
            : req
        )
      );
      
      console.log(`Rejected attendance request ${requestId}`);
      alert('Attendance request rejected.');
    } catch (error) {
      console.error('Error rejecting attendance:', error);
      alert('Failed to reject attendance. Please try again.');
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(`2024-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pendingRequests = requests.filter(req => req.status === 'pending');

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Attendance Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">Loading attendance requests...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Attendance Requests</span>
          <span className="text-sm font-normal bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {pendingRequests.length} pending
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pendingRequests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No pending attendance requests</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  request.is_within_zone 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h4 className="font-medium text-gray-900">{request.worker_name}</h4>
                      <p className="text-sm text-gray-600">{request.worker_email}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      <p>Time: {formatTime(request.request_time)}</p>
                      <p className={`font-medium ${
                        request.is_within_zone ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {request.is_within_zone ? '✓ Within Zone' : '✗ Outside Zone'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleApproveRequest(request.id, request.worker_id, request.is_within_zone)}
                    disabled={!request.is_within_zone}
                    size="sm"
                    className={`${
                      request.is_within_zone 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleRejectRequest(request.id)}
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}