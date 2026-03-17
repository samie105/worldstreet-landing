"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

const STORAGE_KEY = "ws_site_unlocked";
const SITE_PASSWORD = process.env.NEXT_PUBLIC_SITE_PASSWORD ?? "worldstreet2026";

export default function PasswordOverlay() {
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    setUnlocked(stored === "1");
  }, []);

  useEffect(() => {
    if (unlocked === false) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [unlocked]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value === SITE_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      setUnlocked(true);
    } else {
      setError(true);
      setShaking(true);
      setValue("");
      setTimeout(() => setShaking(false), 600);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  // Not yet determined — don't flash
  if (unlocked === null) return null;
  // Already unlocked
  if (unlocked === true) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505] px-4">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#FFCC2D]/5 blur-[140px]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>

      <div className="relative w-full max-w-sm flex flex-col items-center">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-9 h-9 flex items-center justify-center">
            <Image
              src="/worldstreet-logo/WorldStreet4.png"
              alt="Worldstreet Logo"
              width={36}
              height={36}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <span className="text-2xl font-bold tracking-tight">
            <span className="text-white">World</span>
            <span className="text-[#FFCC2D]">Street</span>
            <span className="text-white">.</span>
          </span>
        </div>

        {/* Card */}
        <div className="w-full rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-xl p-8">
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-full border border-white/10 bg-white/5 mb-4">
              <svg className="w-5 h-5 text-[#FFCC2D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-white mb-1">Coming Soon</h1>
            <p className="text-sm text-gray-500">Enter the access password to preview the site.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className={`transition-transform duration-100 ${shaking ? "animate-shake" : ""}`}>
              <input
                ref={inputRef}
                type="password"
                value={value}
                onChange={(e) => { setValue(e.target.value); setError(false); }}
                placeholder="Password"
                autoComplete="off"
                className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white text-sm placeholder:text-gray-600 outline-none transition-colors duration-200 focus:bg-white/7
                  ${error ? "border-red-500/60 focus:border-red-500/60" : "border-white/10 focus:border-[#FFCC2D]/40"}`}
              />
              {error && (
                <p className="mt-1.5 text-xs text-red-400 pl-1">Incorrect password. Try again.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!value}
              className="w-full py-3 rounded-xl bg-[#FFCC2D] text-black font-semibold text-sm hover:bg-white transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              Enter
            </button>
          </form>
        </div>

        <p className="mt-6 text-[11px] text-gray-600">
          © 2026 Worldstreet Markets Limited
        </p>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-6px); }
          30% { transform: translateX(6px); }
          45% { transform: translateX(-5px); }
          60% { transform: translateX(5px); }
          75% { transform: translateX(-3px); }
          90% { transform: translateX(3px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
