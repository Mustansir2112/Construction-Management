"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase-browser"
import { Database } from "@/types/supabase"

type InventoryInsert = Database['public']['Tables']['inventory']['Insert']

export default function AddInventoryForm() {
  const [form, setForm] = useState<InventoryInsert>({
    item_name: "",
    item_id: "",
    zone: "",
    quantity: 0,
    min_stock: 10
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function addItem() {
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: insertError } = await supabase.from("inventory").insert(form)

    setLoading(false)

    if (insertError) {
      console.error("Insert failed:", insertError.message)
      setError(insertError.message)
      return
    }

    setForm({
      item_name: "",
      item_id: "",
      zone: "",
      quantity: 0,
      min_stock: 10
    })
  }

  return (
    <div className="bg-white border border-[#e6dccf] p-4 rounded-xl shadow w-full sm:w-96">

      <div className="grid grid-cols-2 gap-2 mb-3">
        {(["item_name", "item_id", "zone"] as const).map(f => (
          <input
            key={f}
            placeholder={f.replace("_", " ")}
            className="border rounded px-2 py-1 text-sm"
            value={form[f]}
            onChange={e => setForm({ ...form, [f]: e.target.value })}
          />
        ))}

        <input
          type="number"
          placeholder="Quantity"
          className="border rounded px-2 py-1 text-sm"
          value={form.quantity}
          onChange={e => setForm({ ...form, quantity: +e.target.value })}
        />

        <input
          type="number"
          placeholder="Min Stock"
          className="border rounded px-2 py-1 text-sm"
          value={form.min_stock || 10}
          onChange={e => setForm({ ...form, min_stock: +e.target.value })}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 mb-2">
          ❌ {error}
        </p>
      )}

      <button
        onClick={addItem}
        disabled={loading}
        className="
          w-full bg-[#3a2e1f] text-white py-2 rounded 
          hover:opacity-90 transition disabled:opacity-50
        "
      >
        {loading ? "Adding..." : "➕ Add Item"}
      </button>
    </div>
  )
}
