import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  /* ---------------- FETCH ROLE ---------------- */
  let role: string | null = null;

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

  /* ---------------- WORKER ROUTE PROTECTION ---------------- */
  if (pathname.startsWith("/construction-worker")) {
    if (role !== "worker") {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/loginWorker";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

/* ---------------- MATCHER ---------------- */
export const config = {
  matcher: ["/auth/:path*", "/manager/:path*", "/construction-worker/:path*"],
};
