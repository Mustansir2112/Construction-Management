"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase-browser"
import { subscribeToTable } from "@/lib/realtime"
import AddInventoryForm from "@/components/AddInventoryForm"
import { getUserRole } from "@/lib/roleGuard"
import { ResponsiveSidebar } from "@/components/ResponsiveSidebar"

interface InventoryItem {
  id: string
  item_name: string
  item_id: string
  zone: string
  quantity: number
  min_stock: number | null
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [role, setRole] = useState<string>("construction_worker")
  const [loading, setLoading] = useState(true)

  async function fetchInventory() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("inventory")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Fetch failed:", error.message)
      setLoading(false)
      return
    }

    if (data) setInventory(data)
    setLoading(false)
  }

  async function fetchRole() {
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    if (data?.user) {
      const r = await getUserRole(data.user.id)
      // Map worker roles correctly
      const mappedRole = r === "worker" || r === "construction_worker" ? "construction_worker" : r
      setRole(mappedRole)
    }
  }

  useEffect(() => {
    let mounted = true

    async function initializeData() {
      await fetchInventory()
      await fetchRole()

      if (!mounted) return

      const unsubscribe = subscribeToTable<InventoryItem>("inventory", payload => {
        if (payload.eventType === "INSERT") {
          setInventory(prev => [payload.new!, ...prev])
        }

        if (payload.eventType === "UPDATE") {
          setInventory(prev =>
            prev.map(i =>
              i.id === payload.new!.id ? payload.new! : i
            )
          )
        }

        if (payload.eventType === "DELETE") {
          setInventory(prev =>
            prev.filter(i => i.id !== payload.old!.id)
          )
        }
      })

      return unsubscribe
    }

    initializeData()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="flex min-h-screen bg-[#f9f5ef]">
      <ResponsiveSidebar />
      <div className="flex-1 p-6 lg:ml-64">
        <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-[#3a2e1f] flex items-center gap-2">
            📦 Inventory
          </h1>

          {(role === "manager" || role === "engineer" || role === "admin") && (
            <AddInventoryForm />
          )}
        </div>

        {/* Role Badge */}
        <div className="mb-4 text-sm">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#efe6d8] text-[#5b4636] border border-[#e6dccf]">
            Role: <strong className="capitalize">{role}</strong>
          </span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow border border-[#e6dccf] overflow-hidden">

          {loading && (
            <div className="p-6 text-center text-[#8b6f56] animate-pulse">
              Loading inventory…
            </div>
          )}

          {!loading && inventory.length === 0 && (
            <div className="p-6 text-center text-[#8b6f56]">
              No inventory items found.
            </div>
          )}

          {inventory.length > 0 && (
            <table className="w-full text-sm">
              <thead className="bg-[#efe6d8]">
                <tr>
                  <th className="px-4 py-3 text-left">Item</th>
                  <th className="px-4 py-3 text-left">Zone</th>
                  <th className="px-4 py-3 text-left">Qty</th>
                  <th className="px-4 py-3 text-left">Min</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>

              <tbody>
                {inventory.map(item => {
                  const low =
                    item.quantity < (item.min_stock ?? 10)

                  return (
                    <tr
                      key={item.id}
                      className={`
                        border-t transition-all duration-300
                        ${low
                          ? "bg-red-50 animate-pulse"
                          : "hover:bg-[#f4ede4]"
                        }
                      `}
                    >
                      <td className="px-4 py-3 font-medium">
                        {item.item_name}
                        <div className="text-xs text-[#8b6f56]">
                          {item.item_id}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        {item.zone}
                      </td>

                      <td className="px-4 py-3 font-semibold">
                        {item.quantity}
                      </td>

                      <td className="px-4 py-3">
                        {item.min_stock ?? 10}
                      </td>

                      <td
                        className={`px-4 py-3 font-semibold ${
                          low
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {low ? "LOW" : "OK"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}
