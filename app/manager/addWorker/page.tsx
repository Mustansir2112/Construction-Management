"use client"

import { Sidebar } from "@/components/manager/sidebar"
import AddWorkerForm from "./addWorker"

export default function AddWorkerPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-3 md:p-4 lg:p-5 lg:ml-64">
        <div className="mt-4 md:mt-5">
          <AddWorkerForm />
        </div>
      </main>
    </div>
  )
}
