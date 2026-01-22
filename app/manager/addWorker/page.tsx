"use client"

import { ResponsiveSidebar } from "@/components/ResponsiveSidebar"
import AddWorkerForm from "./addWorker"

export default function AddWorkerPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <ResponsiveSidebar />
      <main className="flex-1 p-3 md:p-4 lg:p-5 lg:ml-64">
        <div className="mt-4 md:mt-5">
          <AddWorkerForm />
        </div>
      </main>
    </div>
  )
}
