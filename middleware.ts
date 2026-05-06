import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const LOGIN_URL = "/login";
const WELCOME_URL = "/welcome";

const isAuthRoute = createRouteMatcher(["/login", "/register"]);
const isProtectedRoute = createRouteMatcher([
  "/welcome(.*)",
  "/community(.*)",
  "/vivid(.*)",
  "/leaderboard(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Redirect signed-in users away from auth pages
  if (userId && isAuthRoute(req)) {
    return NextResponse.redirect(new URL(WELCOME_URL, req.url));
  }

  // Redirect unauthenticated users away from protected routes
  if (!userId && isProtectedRoute(req)) {
    const loginUrl = new URL(LOGIN_URL, req.url);
    loginUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(loginUrl);
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
