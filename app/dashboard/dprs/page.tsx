"use client"

import { useEffect, useState } from "react"

type Dprs = {
  id: string
  date: string
  work_done: string
  labor_count: number
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
  }, [])

  if (loading) {
    return <div className="p-6">Loading DPRS...</div>
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Daily Progress Reports</h1>

      {dprs.length === 0 && (
        <div className="text-gray-500">No reports yet.</div>
      )}

      {dprs.map(report => (
        <div key={report.id} className="card p-4">
          <div className="text-sm text-gray-500">{report.date}</div>
          <div className="font-medium">{report.work_done}</div>
          <div>Labor: {report.labor_count}</div>

          {report.issues && (
            <div className="text-red-600">
              Issues: {report.issues}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
