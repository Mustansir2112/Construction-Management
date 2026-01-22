"use client"

import { Sidebar } from "@/components/manager/sidebar"
import { DailyProgressReports } from "@/components/manager/daily-progress-reports"
import { KanbanBoard } from "@/components/manager/kanban-board"
import { AttendanceList } from "@/components/manager/attendance-list"

export default function ManagerDashboardPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <main className="flex-1 p-3 md:p-4 lg:p-5 lg:ml-64">

        <div className="mt-4 md:mt-5 space-y-3 md:space-y-4">
          <DailyProgressReports />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
            <div className="lg:col-span-2">
              <KanbanBoard />
            </div>
            <div>
              <AttendanceList />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
