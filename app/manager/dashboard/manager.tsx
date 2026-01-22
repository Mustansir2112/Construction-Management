"use client"

import { ResponsiveSidebar } from "@/components/ResponsiveSidebar"
import { EnhancedDPR } from "@/components/EnhancedDPR"
import { KanbanBoardIntegrated } from "@/components/manager/KanbanBoardIntegrated"
import { AttendanceListIntegrated } from "@/components/manager/AttendanceListIntegrated"

export default function ManagerDashboardPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <ResponsiveSidebar />

      <main className="flex-1 p-3 md:p-4 lg:p-5 lg:ml-64">
        <div className="mt-4 md:mt-5 space-y-3 md:space-y-4">
          <EnhancedDPR />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
            <div className="lg:col-span-2">
              <KanbanBoardIntegrated />
            </div>
            <div>
              <AttendanceListIntegrated />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
