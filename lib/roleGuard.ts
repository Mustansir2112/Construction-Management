import { supabase } from "@/lib/supabase-browser"

export type UserRole = "worker" | "manager" | "admin"

export async function getUserRole(userId: string): Promise<UserRole> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single()

  if (error || !data) {
    console.warn("Role fetch failed, defaulting to worker:", error?.message)
    return "worker"
  }

  return data.role as UserRole
}