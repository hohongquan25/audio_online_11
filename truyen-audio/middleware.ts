import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Routes that require authentication
const protectedRoutes = ["/profile", "/community/create"];
const protectedPrefixes = ["/listen"];

// Routes that require ADMIN role
const adminPrefixes = ["/admin"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  // Debug log
  console.log("Middleware - pathname:", pathname);
  console.log("Middleware - token:", token ? "exists" : "null");
  console.log("Middleware - role:", token?.role);

  // Check if the route requires authentication
  const isProtectedRoute =
    protectedRoutes.includes(pathname) ||
    protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  const isAdminRoute = adminPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  // Redirect unauthenticated users to login with callbackUrl
  if ((isProtectedRoute || isAdminRoute) && !token) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check admin routes: only ADMIN role allowed
  if (isAdminRoute && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
