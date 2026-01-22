import { createClient } from '@/lib/supabase-server'
import LogoutButton from '@/components/LogoutButton'
import ManagerDashboard from './manager/manager'
import InvoiceHistory from '@/components/InvoiceHistory'

export default async function Home() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <ManagerDashboard />
      <InvoiceHistory />
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                Construction Management Dashboard
              </h1>
              <LogoutButton />
            </div>
            
            {user && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h2 className="text-lg font-medium text-blue-900 mb-2">
                  Welcome back!
                </h2>
                <p className="text-blue-700">
                  Email: {user.email}
                </p>
                <p className="text-blue-700">
                  User ID: {user.id}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Projects
                </h3>
                <p className="text-gray-600">
                  Manage construction projects and track progress
                </p>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Workers
                </h3>
                <p className="text-gray-600">
                  Manage construction workers and assignments
                </p>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Engineers
                </h3>
                <p className="text-gray-600">
                  Manage engineering staff and project oversight
                </p>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Managers
                </h3>
                <p className="text-gray-600">
                  Project management and team coordination
                </p>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Reports
                </h3>
                <p className="text-gray-600">
                  Generate and view project reports
                </p>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Settings
                </h3>
                <p className="text-gray-600">
                  Configure system settings and preferences
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
