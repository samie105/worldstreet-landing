"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Link from "next/link";
import Image from "next/image";
import { LogOut } from "lucide-react";
import BalanceHero from "./BalanceHero";
import PlatformPreviewCard from "./PlatformPreviewCard";
import { welcomePlatforms, type AssetClass } from "./welcome-platforms-data";
import { useClerk } from "@clerk/nextjs";

type Props = {
  firstName: string;
  lastName: string;
  initials: string;
  imageUrl?: string;
};

const ASSET_TABS: { key: AssetClass; label: string }[] = [
  { key: "fiat", label: "Fiat" },
  { key: "crypto", label: "Crypto" },
  { key: "forex", label: "Forex" },
];

export default function WelcomeHub({ firstName, lastName, initials, imageUrl }: Props) {
  const { signOut } = useClerk();
  const greetingRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState<string>("");
  const [assetClass, setAssetClass] = useState<AssetClass>("fiat");

  // Live clock
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setNow(
        d.toLocaleString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
      );
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  // Initial entrance
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from("[data-greet]", {
        opacity: 0,
        y: 16,
        duration: 0.6,
        stagger: 0.08,
        ease: "power3.out",
      });
      gsap.from(heroRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.7,
        delay: 0.15,
        ease: "power3.out",
      });
    });
    return () => ctx.revert();
  }, []);

  // Dramatic re-animate on asset-class switch (entire panel)
  useEffect(() => {
    if (!panelRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, y: 24, scale: 0.985, filter: "blur(8px)" },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.7,
          ease: "power3.out",
        },
      );
    }, panelRef);
    return () => ctx.revert();
  }, [assetClass]);

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white">
      {/* ── Top bar ───────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#050505]/90 backdrop-blur-md">
        <div className="max-w-[1240px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img
              src="/worldstreet-logo/WorldStreet4.png"
              alt="Worldstreet"
              className="h-7 w-auto object-contain"
            />
          </Link>

          <div className="flex items-center gap-3">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={`${firstName} ${lastName}`}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#FFCC2D]/15 border border-[#FFCC2D]/30 flex items-center justify-center text-[11px] font-semibold text-[#FFCC2D]">
                {initials}
              </div>
            )}
            <button
              aria-label="Sign out"
              onClick={() => signOut({ redirectUrl: "/" })}
              className="inline-flex items-center gap-1.5 border border-white/[0.08] hover:bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-gray-300 hover:text-white transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Greeting + asset switcher + balance hero ─────────── */}
      <div className="border-b border-white/[0.08]">
        <div className="max-w-[1240px] mx-auto px-6 md:px-10 pt-10 md:pt-12 pb-10">
          <div
            ref={greetingRef}
            className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6"
          >
            <div>
              <div
                data-greet
                className="text-[10px] uppercase tracking-widest text-gray-500 font-body mb-2"
              >
                {now}
              </div>
              <h1
                data-greet
                className="text-3xl md:text-4xl font-medium tracking-tight text-white"
              >
                Welcome back, <span className="text-[#FFCC2D]">{firstName}</span>
              </h1>
              <p data-greet className="text-[14px] text-gray-400 mt-2 font-body">
                Pick a platform to dive into. Everything from your trading desk to your stream
                room is one click away.
              </p>
            </div>

            {/* Asset-class tab switcher */}
            <div data-greet className="flex flex-col items-start md:items-end gap-2">
              <div className="text-[10px] uppercase tracking-widest text-gray-500 font-body">
                Asset class
              </div>
              <div
                role="tablist"
                aria-label="Asset class"
                className="inline-flex border border-white/[0.08] bg-white/[0.02] p-0.5"
              >
                {ASSET_TABS.map((t) => {
                  const active = t.key === assetClass;
                  return (
                    <button
                      key={t.key}
                      role="tab"
                      aria-selected={active}
                      onClick={() => setAssetClass(t.key)}
                      className={`relative px-4 py-2 text-[11px] font-medium uppercase tracking-widest transition-colors ${
                        active
                          ? "bg-[#FFCC2D] text-black"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div ref={heroRef}>
            <BalanceHero assetClass={assetClass} />
          </div>
        </div>
      </div>

      {/* ── Platforms grid ────────────────────────────────────── */}
      <div className="flex-1">
        <div className="max-w-[1240px] mx-auto px-6 md:px-10 pt-10 md:pt-12 pb-16">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-gray-500 font-body mb-1.5">
                Your platforms
              </div>
              <h2 className="text-xl md:text-2xl font-medium tracking-tight text-white">
                Where do you want to go?
              </h2>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-body">
              {welcomePlatforms.length} platforms
            </span>
          </div>

          {/* Re-mount entire panel on asset-class switch for dramatic re-stagger */}
          <div
            key={assetClass}
            ref={panelRef}
            className="border-t border-l border-white/[0.08]"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {welcomePlatforms.map((platform, i) => (
                <div key={platform.id} className="border-r border-b border-white/[0.08]">
                  <PlatformPreviewCard platform={platform} index={i} assetClass={assetClass} />
                </div>
              ))}
            </div>
          </div>

          {/* Footer hint */}
          <div className="mt-6 flex items-center justify-between text-[10px] uppercase tracking-widest text-gray-500 font-body">
            <span>One wallet · Many platforms · One Worldstreet</span>
            <Link href="/" className="hover:text-white transition-colors">
              ← Back to landing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
