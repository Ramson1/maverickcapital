import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Auth pages redirect to dashboard if already logged in
  if (isPublicRoute) {
    return await updateSession(request);
  }

  // Protect all /dashboard and /admin routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
    const response = await updateSession(request);
    const { supabase } = await import("@/lib/supabase/server").then(async (mod) => ({
      supabase: await mod.createClient(),
    }));

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Check admin routes for admin role
    if (pathname.startsWith("/admin")) {
      const { data: profile } = await supabase
        .from("mc_profiles")
        .select("mc_user_roles(mc_roles(name))")
        .eq("id", user.id)
        .single();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userRoles = (profile?.mc_user_roles as any[]) || [];
      const roles = userRoles
        .flatMap((ur: any) => (Array.isArray(ur.mc_roles) ? ur.mc_roles : [ur.mc_roles]))
        .filter(Boolean);
      const isAdmin = roles.some((r) =>
        ["super_admin", "admin", "moderator"].includes(r.name)
      );

      if (!isAdmin) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    return response;
  }

  // Default: redirect / to /dashboard
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
