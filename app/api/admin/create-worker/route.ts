// app/api/admin/create-worker/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, fullName, phone, password ,role} = body;
    console.log(role,email,fullName,phone,password);
    // Validate required fields
    if (!email || !fullName || !phone || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. Create auth user with the provided password
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

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authUser.user.id;

    // Use the role from body, default to "worker" if not provided
    // Map construction_worker to worker for consistency
    // Also handle "engineer" role
    let userRole = role || "worker";
    if (userRole === "construction_worker") {
      userRole = "worker";
    }
    // Ensure role is valid
    if (!["worker", "engineer", "manager", "admin"].includes(userRole)) {
      userRole = "worker";
    }

    // 2. Insert profile
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: userId,
        email,
        full_name: fullName,
        phone,
        role: userRole === "worker" ? "construction_worker" : userRole, // profiles table uses construction_worker
      });

    if (profileError) {
      console.error("Profile insert error:", profileError);
      return NextResponse.json(
        { error: "Failed to create profile" },
        { status: 400 }
      );
    }

    // 3. Insert role (SOURCE OF TRUTH)
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({
        id: userId,
        role: userRole,
      });

    if (roleError) {
      console.error("Role insert error:", roleError);
      return NextResponse.json(
        { error: "Failed to assign role" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, userId, email },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating worker:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}