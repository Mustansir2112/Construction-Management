"use client";

import { Suspense, lazy, useState, useEffect } from "react";
import { ResponsiveSidebar } from "@/components/ResponsiveSidebar";
import { createClient } from "@/lib/supabase-browser";
import { getUserRole } from "@/lib/roleGuard";
import { Package, Move, ClipboardList, Clock, TrendingUp } from "lucide-react";

// Lazy load components for better performance
const InventoryCard = lazy(() => import("@/components/worker/InventoryCard"));
const MovementsCard = lazy(() => import("@/components/worker/MovementsCard"));
const DPRsCard = lazy(() => import("@/components/worker/DPRsCard"));
const TasksCard = lazy(() => import("@/components/worker/TasksCard"));
import CreateDPRForm from "@/components/worker/CreateDPRForm";

interface Stats {
  inventoryItems: number;
  pendingMovements: number;
  todayDPRs: number;
  activeTasks: number;
}

export default function ConstructionWorkerDashboard() {
  const [stats, setStats] = useState<Stats>({
    inventoryItems: 0,
    pendingMovements: 0,
    todayDPRs: 0,
    activeTasks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string>("worker");

  useEffect(() => {
    async function initialize() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const userRole = await getUserRole(user.id);
        setRole(userRole);
      }

      await fetchStats();
      setLoading(false);
    }

    initialize();
  }, []);

  async function fetchStats() {
    const supabase = createClient();
    
    try {
      // Fetch inventory count
      const { count: inventoryCount } = await supabase
        .from("inventory")
        .select("*", { count: "exact", head: true });

      // Fetch pending movements
      const { count: movementsCount } = await supabase
        .from("movements")
        .select("*", { count: "exact", head: true })
        .eq("approved", false);

      // Fetch today's DPRs from database table, not storage
      const today = new Date().toISOString().split("T")[0];
      const { count: dprsCount } = await (supabase
        .from("dprs" as any)
        .select("*", { count: "exact", head: true })
        .gte("date", today));

      setStats({
        inventoryItems: inventoryCount || 0,
        pendingMovements: movementsCount || 0,
        todayDPRs: dprsCount || 0,
        activeTasks: 0, // TODO: Add tasks count
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <ResponsiveSidebar />
        <main className="flex-1 p-4 lg:ml-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <ResponsiveSidebar />
      
      <main className="flex-1 p-4 md:p-6 lg:p-8 lg:ml-64">
        {/* Header with animation */}
        <div className="mb-6 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Welcome Back! 👷
          </h1>
          <p className="text-slate-600">
            Manage your work, track inventory, and log daily progress
          </p>
        </div>

        {/* Stats Grid with staggered animation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Package}
            label="Inventory"
            value={stats.inventoryItems}
            color="bg-blue-500"
            delay={0}
          />
          <StatCard
            icon={Move}
            label="Movements"
            value={stats.pendingMovements}
            color="bg-amber-500"
            delay={100}
          />
          <StatCard
            icon={ClipboardList}
            label="Today's DPRs"
            value={stats.todayDPRs}
            color="bg-green-500"
            delay={200}
          />
          <StatCard
            icon={TrendingUp}
            label="Active Tasks"
            value={stats.activeTasks}
            color="bg-purple-500"
            delay={300}
          />
        </div>

        {/* Create DPR Section - Collapsible */}
        <div className="mb-6">
          <details className="bg-white rounded-xl shadow-md p-4">
            <summary className="cursor-pointer font-semibold text-lg text-slate-900 flex items-center gap-2 list-none">
              <ClipboardList className="w-5 h-5" />
              <span>Create Daily Progress Report</span>
            </summary>
            <div className="mt-4">
              <CreateDPRForm onSuccess={() => {
                fetchStats();
                // Close details after success
                const details = document.querySelector('details');
                if (details) details.removeAttribute('open');
              }} />
            </div>
          </details>
        </div>

        {/* Main Content Grid with lazy loading */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Suspense
            fallback={
              <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
                <div className="h-32 bg-slate-200 rounded"></div>
              </div>
            }
          >
            <InventoryCard />
          </Suspense>

          <Suspense
            fallback={
              <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
                <div className="h-32 bg-slate-200 rounded"></div>
              </div>
            }
          >
            <MovementsCard />
          </Suspense>

          <Suspense
            fallback={
              <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
                <div className="h-32 bg-slate-200 rounded"></div>
              </div>
            }
          >
            <DPRsCard />
          </Suspense>

          <Suspense
            fallback={
              <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
                <div className="h-32 bg-slate-200 rounded"></div>
              </div>
            }
          >
            <TasksCard />
          </Suspense>
        </div>
      </main>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  delay,
}: {
  icon: any;
  label: string;
  value: number;
  color: string;
  delay: number;
}) {
  return (
    <div
      className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`${color} p-2 rounded-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-900 mb-1">{value}</div>
      <div className="text-sm text-slate-600">{label}</div>
    </div>
  );
}
