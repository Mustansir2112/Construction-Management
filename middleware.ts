import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Safety check (env vars)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Validate environment variables exist and URL is properly formatted
  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    !supabaseUrl.startsWith('http') ||
    supabaseUrl.includes('your_supabase_project_url_here') ||
    supabaseAnonKey.includes('your_supabase_anon_key_here')
  ) {
    console.warn('[Middleware] Supabase not configured properly. Skipping authentication checks.');
    return NextResponse.next();
  }

  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // 🔑 Always fetch user first
  let user = null;
  let role: string | null = null;

  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;

    // Fetch role if user exists
    if (user) {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("[Middleware] Role fetch error:", error.message);
      }
      role = data?.role ?? null;
    }
  } catch (error) {
    console.error("[Middleware] Supabase error:", error);
    // In development, allow access when Supabase fails
    if (process.env.NODE_ENV === 'development') {
      console.warn("[Middleware] Development mode: Allowing access without authentication");
      return NextResponse.next();
    }
  }

  const pathname = request.nextUrl.pathname;

  /* ---------------- PUBLIC ROUTES ---------------- */
  const publicRoutes = ["/", "/auth/loginAdmin", "/auth/loginWorker"];

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  /* ---------------- NOT LOGGED IN ---------------- */
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();

    // 🔥 FIX: send worker → worker login, manager → admin login
    if (pathname.startsWith("/construction-worker")) {
      url.pathname = "/auth/loginWorker";
    } else {
      url.pathname = "/auth/loginAdmin";
    }

    return NextResponse.redirect(url);
  }

  /* ---------------- LOGGED IN ON LOGIN PAGE ---------------- */
  if (
    user &&
    (pathname.startsWith("/auth/loginAdmin") ||
      pathname.startsWith("/auth/loginWorker"))
  ) {
    const url = request.nextUrl.clone();

    if (role === "manager") {
      url.pathname = "/manager/dashboard";
      return NextResponse.redirect(url);
    }

    if (role === "engineer") {
      url.pathname = "/engineer";
      return NextResponse.redirect(url);
    }

    if (role === "worker") {
      url.pathname = "/construction-worker";
      return NextResponse.redirect(url);
    }

    return response;
  }

  /* ---------------- MANAGER ROUTE PROTECTION ---------------- */
  if (pathname.startsWith("/manager")) {
    if (role !== "manager") {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/loginAdmin";
      return NextResponse.redirect(url);
    }
  }

  /* ---------------- ENGINEER ROUTE PROTECTION ---------------- */
  if (pathname.startsWith("/engineer")) {
    if (role !== "engineer") {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/loginAdmin";
      return NextResponse.redirect(url);
    }
  }

  /* ---------------- WORKER ROUTE PROTECTION ---------------- */
  if (pathname.startsWith("/construction-worker")) {
    if (role !== "worker" && role !== "construction_worker") {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/loginWorker";
      return NextResponse.redirect(url);
    }
  }

  /* ---------------- SHARED ROUTES (Inventory, Movements, Dashboard) ---------------- */
  if (pathname.startsWith("/inventory") || pathname.startsWith("/movements") || pathname.startsWith("/dashboard")) {
    // Both managers and workers can access, but must be authenticated
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/loginAdmin";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

/* ---------------- MATCHER ---------------- */
export const config = {
  matcher: [
    "/auth/:path*",
    "/manager/:path*",
    "/engineer/:path*",
    "/construction-worker/:path*",
    "/inventory/:path*",
    "/movements/:path*",
    "/dashboard/:path*",
  ],
};
