import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths that do not require session
  const isPublicPath =
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/api/ical/export") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".");

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Allow proceeding to dashboard
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
