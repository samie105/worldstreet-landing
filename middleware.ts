import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const WELCOME_URL = "/welcome";
const isAuthRoute = createRouteMatcher(["/login", "/register"]);
const isProtectedRoute = createRouteMatcher(["/welcome"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Redirect unauthenticated users away from protected routes to local /login
  if (!userId && isProtectedRoute(req)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Redirect signed-in users away from auth pages to the welcome hub
  if (userId && isAuthRoute(req)) {
    return NextResponse.redirect(new URL(WELCOME_URL, req.url));
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
