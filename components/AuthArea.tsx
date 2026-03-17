"use client";

import Link from "next/link";
import Image from "next/image";
import { useSignIn, useSignUp, useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "https://dashboard.worldstreetgold.com/";

export default function AuthArea({ mode }: { mode: "login" | "register" }) {
  const isRegister = mode === "register";
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const { signIn, fetchStatus: signInFetchStatus } = useSignIn();
  const { signUp, fetchStatus: signUpFetchStatus } = useSignUp();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthLoaded && isSignedIn) {
      window.location.href = DASHBOARD_URL;
    }
  }, [isAuthLoaded, isSignedIn]);

  const handleGoogleAuth = async () => {
    if (isSignedIn) {
      window.location.href = DASHBOARD_URL;
      return;
    }

    setIsLoading(true);
    try {
      if (isRegister) {
        await signUp?.sso({
          strategy: "oauth_google",
          redirectUrl: "/sso-callback",
          redirectCallbackUrl: DASHBOARD_URL,
        });
      } else {
        await signIn?.sso({
          strategy: "oauth_google",
          redirectUrl: "/sso-callback",
          redirectCallbackUrl: DASHBOARD_URL,
        });
      }
    } catch (error) {
      console.error("OAuth error:", error);
      setIsLoading(false);
    }
  };

  if (isAuthLoaded && isSignedIn) return null;

  const isReady = isRegister
    ? signUpFetchStatus === "idle"
    : signInFetchStatus === "idle";

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-32 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 rounded-full bg-brand/4 blur-[120px]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/6 to-transparent" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 flex items-center justify-center">
              <Image
                src="/worldstreet-logo/WorldStreet4.png"
                alt="Worldstreet Logo"
                width={36}
                height={36}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              <span className="text-white">World</span>
              <span className="text-brand">Street</span>
              <span className="text-white">.</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8 sm:p-10">
          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 font-sans">
              {isRegister ? "Create your account" : "Welcome back"}
            </h1>
            <p className="text-sm text-gray-400">
              {isRegister ? (
                <>
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-brand hover:text-brand/80 font-medium transition-colors"
                  >
                    Sign in
                  </Link>
                </>
              ) : (
                <>
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="text-brand hover:text-brand/80 font-medium transition-colors"
                  >
                    Create one free
                  </Link>
                </>
              )}
            </p>
          </div>

          {/* Google OAuth Button */}
          <button
            onClick={handleGoogleAuth}
            disabled={!isReady || isLoading}
            className="group relative w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl border border-white/10 bg-white/3 text-white font-medium text-sm transition-all duration-300 hover:bg-white/7 hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {/* Google icon */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span>
              {isLoading
                ? "Redirecting..."
                : isRegister
                ? "Sign up with Google"
                : "Sign in with Google"}
            </span>

            {/* Subtle glow on hover */}
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ring-1 ring-brand/20" />
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/6" />
            <span className="text-[11px] uppercase tracking-widest text-gray-500 font-medium">
              Secure & Trusted
            </span>
            <div className="flex-1 h-px bg-white/6" />
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 text-gray-500">
            <div className="flex items-center gap-1.5 text-xs">
              <svg
                className="w-3.5 h-3.5 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span>SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <svg
                className="w-3.5 h-3.5 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>Data Protected</span>
            </div>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-[11px] text-gray-600 mt-6 leading-relaxed max-w-xs mx-auto">
          By continuing, you agree to Worldstreet&apos;s{" "}
          <a
            href="/legal-docs/WS Terms of Business.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors underline underline-offset-2"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="/legal-docs/Privacy Policy.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors underline underline-offset-2"
          >
            Privacy Policy
          </a>
        </p>
      </div>
    </section>
  );
}
