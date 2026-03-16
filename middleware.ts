import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const DASHBOARD_URL = "https://dashboardv2.worldstreetgold.com/";
const isAuthRoute = createRouteMatcher(["/login", "/register"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Redirect signed-in users away from auth pages to the dashboard
  if (userId && isAuthRoute(req)) {
    return NextResponse.redirect(DASHBOARD_URL);
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
