import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export async function POST(req: Request) {
  const body = await req.json()
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Auto-assign project if not provided
  let projectId = body.project_id
  if (!projectId) {
    const { data: assignment } = await supabase
      .from("project_assignments")
      .select("project_id")
      .eq("user_id", user.id)
      .limit(1)
      .single()
    
    if (assignment) {
      projectId = assignment.project_id
    }
  }

  const { error } = await supabase.from("dprs").insert({
    project: projectId || null,
    date: body.date,
    work_done: body.work_done,
    labor_count: body.labor_count || 0,
    materials_used: body.materials_used || null,
    issues: body.issues || null,
    photos: body.photos || [],
    videos: body.videos || [],
    full_text: body.full_text || body.work_done,
    short_summary: body.short_summary || body.work_done,
    created_by: body.created_by || user.id,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("dprs")
    .select("*")
    .order("date", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data || [])
}
