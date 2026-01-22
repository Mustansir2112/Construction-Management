'use client'

import { supabase } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
    })

    // Optional: redirect after logout
    window.location.href = "/login"
  }

  return (
    <button
      onClick={handleLogout}
      className="btn-outline"
    >
      Logout
    </button>
  )
}

  
