import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const workerId = searchParams.get("worker_id");

  let query = supabase
    .from("attendance")
    .select("*")
    .order("date", { ascending: false });

  if (date) {
    query = query.eq("date", date);
  }

  if (workerId) {
    query = query.eq("w_id", workerId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}
