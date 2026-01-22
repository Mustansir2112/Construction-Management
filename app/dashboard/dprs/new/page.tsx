"use client"
import { useState } from "react"

export default function NewDprsPage() {
  const [form, setForm] = useState({
    date: "",
    work_done: "",
    labor_count: 0,
    materials_used: "",
    issues: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch("/api/dprs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    window.location.href = "/dashboard/dprs"
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-xl font-semibold mb-4">New DPRS</h1>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="date"
          className="w-full border p-2 rounded"
          onChange={e => setForm({ ...form, date: e.target.value })}
        />

        <textarea
          placeholder="Work done"
          className="w-full border p-2 rounded"
          onChange={e => setForm({ ...form, work_done: e.target.value })}
        />

        <input
          type="number"
          placeholder="Labor count"
          className="w-full border p-2 rounded"
          onChange={e => setForm({ ...form, labor_count: +e.target.value })}
        />

        <textarea
          placeholder="Materials used"
          className="w-full border p-2 rounded"
          onChange={e => setForm({ ...form, materials_used: e.target.value })}
        />

        <textarea
          placeholder="Issues"
          className="w-full border p-2 rounded"
          onChange={e => setForm({ ...form, issues: e.target.value })}
        />

        <button className="btn-primary w-full">Submit</button>
      </form>
    </div>
  )
}
