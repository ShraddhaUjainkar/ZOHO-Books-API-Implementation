import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getValidAccessToken } from "./lib/zoho";

export async function proxy(request: NextRequest) {
  let isAuthenticated = false;

  try {
    // This will check for a valid access token, or attempt to refresh it.
    // If it throws an error, the user is not authenticated.
    const token = await getValidAccessToken();
    if (token) {
      isAuthenticated = true;
    }
  } catch (error) {
    console.error("Middleware validation failed:", error);
    isAuthenticated = false;
  }

  const { pathname } = request.nextUrl;

  // 1. If the user is trying to access the login page while already authenticated
  if (pathname === "/login" && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 2. If the user is unauthenticated and trying to access protected routes
  // (Everything is protected except /login and the /api/auth routes)
  if (
    !isAuthenticated &&
    pathname !== "/login" &&
    !pathname.startsWith("/api/auth")
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Configure the paths where this middleware should run
export const config = {
  // Run on all paths EXCEPT:
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - favicon.ico (favicon file)
  // - any files with extensions (e.g., .svg, .png)
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
