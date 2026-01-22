import { createClient } from '@/lib/supabase-server'
import LogoutButton from '@/components/LogoutButton'
import StatCard from '@/components/Statcard'
import AlertPanel from "@/components/AlertPanel"

interface InventoryItem {
  quantity: number
  min_stock?: number
}

interface Movement {
  approved: boolean
}

interface Alert {
  [key: string]: unknown
}

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: inventory } = await supabase
    .from('inventory')
    .select('*') as { data: InventoryItem[] | null }

  const { data: movements } = await supabase
    .from('movements')
    .select('*') as { data: Movement[] | null }

  const { data: alerts } = await supabase
    .from('alerts')
    .select('*') as { data: Alert[] | null }

  const lowStock =
    inventory?.filter(i => i.quantity < (i.min_stock ?? 10)).length ?? 0

  const unauthorized =
    movements?.filter(m => !m.approved).length ?? 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF7F2] to-[#F1E8D9] text-[#2B2B2B] px-4 py-8 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">

        {/* Container */}
        <div className="bg-white/90 backdrop-blur border border-[#E5E0D8] rounded-2xl shadow-xl transition-all duration-500 animate-fadeIn">

          <div className="p-6 sm:p-10">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-10">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#2B2B2B]">
                🛡 TheftGuard Control Center
              </h1>
              <LogoutButton />
            </div>

            {/* User Panel */}
            {user && (
              <div className="mb-10 p-6 rounded-xl bg-gradient-to-r from-[#F6EBDD] to-[#FDF7EF] border border-[#E5E0D8] shadow-sm hover:shadow-md transition">
                <h2 className="text-lg font-semibold mb-2">Welcome back 👋</h2>
                <p className="text-sm text-[#5B4636] truncate">📧 {user.email}</p>
                <p className="text-xs text-[#8B6F56] mt-1 break-all">
                  🆔 {user.id}
                </p>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
              <StatCard title="Status" value="ACTIVE" color="text-green-600" />
              <StatCard title="Inventory" value={inventory?.length ?? 0} />
              <StatCard title="Movements" value={movements?.length ?? 0} />
              <StatCard title="Unauthorized" value={unauthorized} color="text-red-600" />
              <StatCard title="Low Stock" value={lowStock} color="text-orange-600" />
              <StatCard title="Alerts" value={alerts?.length ?? 0} color="text-red-600" />
            </div>

            {/* Feature Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">

              {[
                { title: 'Inventory', desc: 'Track tools, materials, and stock levels in real-time', icon: '📦' },
                { title: 'Movements', desc: 'Monitor item movement between zones and workers', icon: '🔄' },
                { title: 'Alerts', desc: 'Unauthorized activity and low stock notifications', icon: '🚨' },
                { title: 'Workers', desc: 'Worker identity and access tracking', icon: '👷' },
                { title: 'Reports', desc: 'Theft risk analytics and history reports', icon: '📊' },
                { title: 'Settings', desc: 'System rules, stock thresholds, and permissions', icon: '⚙️' },
              ].map((card) => (
                <div
                  key={card.title}
                  className="
                    group bg-white border border-[#E5E0D8] rounded-xl p-6 
                    shadow-sm hover:shadow-lg 
                    hover:-translate-y-1 transition-all duration-300
                  "
                >
                  <div className="text-3xl mb-3 group-hover:scale-110 transition">
                    {card.icon}
                  </div>

                  <h3 className="text-lg font-semibold mb-2 group-hover:text-[#8B6F56] transition">
                    {card.title}
                  </h3>

                  <p className="text-sm text-[#5B4636] leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              ))}

            </div>
          </div>
        </div>
      </div>

      {/* 🔴 Live Alerts Panel */}
      <AlertPanel />
    </div>
  )
}
