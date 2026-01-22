"use client"
import { useState } from "react"
import { supabase } from "@/lib/supabase-browser"
import { Database } from "@/types/supabase"

type MovementInsert = Database['public']['Tables']['movements']['Insert']

export default function AddMovementForm() {
  const [form, setForm] = useState<MovementInsert>({
    worker_id: "",
    item_id: "",
    from_zone: "",
    to_zone: "",
    approved: false
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    setLoading(true)
    setError(null)

    const { error: insertError } = await supabase.from("movements").insert(form)
    
    setLoading(false)

    if (insertError) {
      console.error("Error inserting movement:", insertError.message)
      setError(insertError.message)
      return
    }
    
    // Reset form
    setForm({
      worker_id: "",
      item_id: "",
      from_zone: "",
      to_zone: "",
      approved: false
    })
  }

  return (
    <div className="bg-white border border-[#e6dccf] p-4 rounded-xl shadow">
      <div className="grid grid-cols-2 gap-2">
        {(["worker_id", "item_id", "from_zone", "to_zone"] as const).map(f => (
          <input
            key={f}
            placeholder={f.replace("_", " ")}
            className="border rounded px-2 py-1"
            value={form[f]}
            onChange={e => setForm({ ...form, [f]: e.target.value })}
          />
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600 mt-2">
          ❌ {error}
        </p>
      )}

      <button
        onClick={submit}
        disabled={loading}
        className="mt-3 w-full bg-[#3a2e1f] text-white py-2 rounded hover:opacity-90 transition disabled:opacity-50"
      >
        {loading ? "Logging..." : "Log Movement"}
      </button>
    </div>
  )
}
