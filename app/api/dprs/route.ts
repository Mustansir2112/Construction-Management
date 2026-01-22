import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export async function POST(req: Request) {
  const body = await req.json()
  const supabase = createClient()

  const { error } = await supabase.from("dprs").insert({
    date: body.date,
    work_done: body.work_done,
    labor_count: body.labor_count,
    materials_used: body.materials_used,
    issues: body.issues,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
