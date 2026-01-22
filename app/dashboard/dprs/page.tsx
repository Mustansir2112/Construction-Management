"use client"

import { useEffect, useState } from "react"
import { ResponsiveSidebar } from "@/components/ResponsiveSidebar"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

type Dprs = {
  id: string
  date: string
  work_done: string
  labor_count: number
  materials_used?: string | null
  issues: string | null
}

export default function DprsPage() {
  const [dprs, setDprs] = useState<Dprs[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/dprs")
      .then(res => res.json())
      .then(data => {
        setDprs(data)
        setLoading(false)
      })
      .catch(err => {
        console.error("Error fetching DPRs:", err)
        setLoading(false)
      })
  }, [])

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <ResponsiveSidebar />
      <div className="flex-1 p-4 md:p-6 lg:p-8 lg:ml-64">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-slate-900">Daily Progress Reports</h1>
            <Link href="/dashboard/dprs/new">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                New DPR
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card p-6 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
                  <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : dprs.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-slate-500 mb-4">No reports yet.</p>
              <Link href="/dashboard/dprs/new">
                <Button variant="outline">Create your first DPR</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {dprs.map((report, index) => (
                <div
                  key={report.id}
                  className="card p-6 hover:shadow-lg transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-sm text-slate-500 font-medium">{report.date}</div>
                    <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                      {report.labor_count} workers
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <h3 className="font-semibold text-slate-900 mb-2">Work Done:</h3>
                    <p className="text-slate-700">{report.work_done}</p>
                  </div>

                  {report.materials_used && (
                    <div className="mb-3">
                      <h3 className="font-semibold text-slate-900 mb-1 text-sm">Materials Used:</h3>
                      <p className="text-slate-600 text-sm">{report.materials_used}</p>
                    </div>
                  )}

                  {report.issues && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm font-semibold text-red-800 mb-1">⚠️ Issues:</p>
                      <p className="text-sm text-red-700">{report.issues}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
