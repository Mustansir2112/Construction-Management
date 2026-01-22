import { supabaseAdmin } from "@/lib/supabase-server"
import { Database } from "@/types/supabase"

type AlertInsert = Database['public']['Tables']['alerts']['Insert']

export async function runAlertEngine(item: {
  id: string
  item_name: string
  quantity: number
  min_stock: number | null
}) {
  const min = item.min_stock ?? 10

  if (item.quantity >= min) return

  const alertData: AlertInsert = {
    message: `Low stock for ${item.item_name} (${item.quantity} left)`,
    level: "warning"
  }

  await supabaseAdmin.from("alerts").insert(alertData)
}
