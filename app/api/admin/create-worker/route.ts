// app/api/admin/create-worker/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

// Admin client (service role)
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,   // 🔴 SECRET KEY
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, fullName, phone, password, role } = body;

    console.log("INPUT:", email, fullName, phone, password, role);

    // Validate required fields
    if (!email || !fullName || !phone || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Normalize role
    let userRole = role || "worker";
    if (userRole === "construction_worker") userRole = "worker";
    if (!["worker", "engineer", "manager", "admin"].includes(userRole)) {
      userRole = "worker";
    }

    // 1. CREATE AUTH USER
    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          phone,
        },
      });

    console.log("AUTH RESULT:", authUser, "ERROR:", authError);

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authUser.user.id;

    // 2. INSERT ROLE (SOURCE OF TRUTH)
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({
        id: userId,
        role: userRole,
      });

    console.log("ROLE INSERT ERROR:", roleError);

    if (roleError) {
      // Rollback auth user
      await supabaseAdmin.auth.admin.deleteUser(userId);

      return NextResponse.json(
        { error: roleError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, userId, email, role: userRole },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("🔥 FATAL ERROR:", error);

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}