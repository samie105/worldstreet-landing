"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Link from "next/link";
import Image from "next/image";
import { LogOut, Phone, Video, MessageSquare, Search, X, PhoneMissed } from "lucide-react";
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

const CONTACTS = [
  { id: "c1", name: "Sarah Chen", handle: "@sarahc", online: true, avatar: "https://ui-avatars.com/api/?name=Sarah+Chen&background=0D8ABC&color=fff&bold=true" },
  { id: "c2", name: "Trader Jay", handle: "@trader_jay", online: true, avatar: "https://ui-avatars.com/api/?name=Trader+Jay&background=7C3AED&color=fff&bold=true" },
  { id: "c3", name: "Mike Thorne", handle: "@mscalp", online: false, avatar: "https://ui-avatars.com/api/?name=Mike+Thorne&background=EC4899&color=fff&bold=true" },
  { id: "c4", name: "Kelly", handle: "@kelly", online: true, avatar: "https://ui-avatars.com/api/?name=Kelly&background=06B6D4&color=fff&bold=true" },
  { id: "c5", name: "NG Forex Group", handle: "Group · 14", online: true, avatar: "https://ui-avatars.com/api/?name=NG+Forex&background=F59E0B&color=fff&bold=true" },
  { id: "c6", name: "Lola (Admin)", handle: "@lola", online: false, avatar: "https://ui-avatars.com/api/?name=Lola&background=10B981&color=fff&bold=true" },
  { id: "c7", name: "Carlos R.", handle: "@carlosr", online: true, avatar: "https://ui-avatars.com/api/?name=Carlos&background=8B5CF6&color=fff&bold=true" },
  { id: "c8", name: "Spot Traders", handle: "Group · 38", online: true, avatar: "https://ui-avatars.com/api/?name=Spot+Traders&background=FFCC2D&color=000&bold=true" },
];

const RECENT_CALLS = {
  voice: [
    { id: "v1", name: "Sarah Chen", when: "5m ago", missed: true, duration: undefined },
    { id: "v2", name: "NG Forex Group", when: "1h ago", missed: false, duration: "24m" },
    { id: "v3", name: "Trader Jay", when: "3h ago", missed: false, duration: "12m" },
    { id: "v4", name: "Kelly", when: "yesterday", missed: false, duration: "6m" },
  ],
  video: [
    { id: "vid1", name: "Trader Jay", when: "22m ago", missed: true, duration: undefined },
    { id: "vid2", name: "Mike Thorne", when: "2h ago", missed: false, duration: "8m 42s" },
    { id: "vid3", name: "Kelly (Spot Traders)", when: "yesterday", missed: false, duration: "4m" },
    { id: "vid4", name: "Carlos R.", when: "2d ago", missed: false, duration: "31m" },
  ],
} as const;

const MESSAGES_PREVIEW = [
  { id: "dm1", name: "Sarah Chen", preview: "Anyone watching SUI? Looking primed for a breakout.", when: "3m", unread: 2, online: true, avatar: "https://ui-avatars.com/api/?name=Sarah+Chen&background=0D8ABC&color=fff&bold=true" },
  { id: "dm2", name: "Spot Traders", preview: "New trade alert posted in the group — BTC long signal.", when: "18m", unread: 5, online: true, avatar: "https://ui-avatars.com/api/?name=Spot+Traders&background=FFCC2D&color=000&bold=true" },
  { id: "dm3", name: "Vivid AI", preview: "BTC/USDT is showing a bullish flag on the 4H…", when: "just now", unread: 1, online: true, avatar: "https://ui-avatars.com/api/?name=Vivid+AI&background=06B6D4&color=fff&bold=true" },
  { id: "dm4", name: "Trader Jay", preview: "Yo, did you see the DXY move this morning?", when: "1h", unread: 0, online: true, avatar: "https://ui-avatars.com/api/?name=Trader+Jay&background=7C3AED&color=fff&bold=true" },
  { id: "dm5", name: "NG Forex Group", preview: "Lola: Welcome to NG Forex! Post your setups here.", when: "2h", unread: 0, online: true, avatar: "https://ui-avatars.com/api/?name=NG+Forex&background=F59E0B&color=fff&bold=true" },
  { id: "dm6", name: "Mike Thorne", preview: "Live floor replay is up if you missed it.", when: "4h", unread: 0, online: false, avatar: "https://ui-avatars.com/api/?name=Mike+Thorne&background=EC4899&color=fff&bold=true" },
];

export default function WelcomeHub({ firstName, lastName, initials, imageUrl }: Props) {
  const { signOut } = useClerk();
  const greetingRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState<string>("");
  const [assetClass, setAssetClass] = useState<AssetClass>("fiat");

  const [callsOpen, setCallsOpen] = useState(false);
  const [callTab, setCallTab] = useState<"voice" | "video" | "messages">("voice");
  const [contactSearch, setContactSearch] = useState("");

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

            {/* Communication hub button */}
            <div className="relative">
              <button
                onClick={() => setCallsOpen((v) => !v)}
                className="w-8 h-8 flex items-center justify-center border border-white/[0.08] hover:bg-white/[0.04] text-gray-400 hover:text-white transition-colors relative"
                aria-label="Communication hub"
              >
                <Phone className="w-3.5 h-3.5" />
                <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-rose-400" />
              </button>

              {callsOpen && (
                <div className="absolute top-11 right-0 z-50 w-[420px] max-h-[560px] flex flex-col border border-white/[0.08] bg-[#0a0a0a] shadow-2xl">
                  {/* Hub header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] shrink-0">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#FFCC2D]" />
                      <span className="text-[11px] font-medium uppercase tracking-widest text-white">
                        Community
                      </span>
                    </div>
                    <button
                      onClick={() => setCallsOpen(false)}
                      className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Search */}
                  <div className="px-4 py-2.5 border-b border-white/[0.08] shrink-0">
                    <div className="flex items-center gap-2 border border-white/[0.08] bg-white/[0.03] px-3 py-2">
                      <Search className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                      <input
                        type="text"
                        value={contactSearch}
                        onChange={(e) => setContactSearch(e.target.value)}
                        placeholder="Search contacts…"
                        className="flex-1 bg-transparent text-[12px] text-white placeholder-gray-600 outline-none"
                      />
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b border-white/[0.08] shrink-0">
                    {(["voice", "video", "messages"] as const).map((tab) => {
                      const active = callTab === tab;
                      const Icon = tab === "voice" ? Phone : tab === "video" ? Video : MessageSquare;
                      return (
                        <button
                          key={tab}
                          onClick={() => setCallTab(tab)}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-medium uppercase tracking-widest transition-colors border-b-2 ${
                            active
                              ? "text-[#FFCC2D] border-[#FFCC2D]"
                              : "text-gray-500 border-transparent hover:text-white"
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                          {tab}
                        </button>
                      );
                    })}
                  </div>

                  {/* Scrollable body */}
                  <div className="flex-1 overflow-y-auto">

                    {/* ── Voice / Video tabs ── */}
                    {(callTab === "voice" || callTab === "video") && (
                      <>
                        {/* Contacts row */}
                        <div className="px-4 pt-4 pb-3 border-b border-white/[0.06]">
                          <div className="text-[9px] uppercase tracking-widest text-gray-500 mb-3">
                            Contacts
                          </div>
                          <div className="overflow-x-auto scrollbar-hide">
                            <div className="flex gap-3 pb-1" style={{ width: "max-content" }}>
                              {CONTACTS
                                .filter((c) =>
                                  contactSearch
                                    ? c.name.toLowerCase().includes(contactSearch.toLowerCase())
                                    : true
                                )
                                .map((c) => (
                                  <button
                                    key={c.id}
                                    className="flex flex-col items-center gap-1.5 group/ct"
                                    title={`${callTab === "voice" ? "Call" : "Video call"} ${c.name}`}
                                  >
                                    <div className="relative">
                                      <Image
                                        src={c.avatar}
                                        alt={c.name}
                                        width={40}
                                        height={40}
                                        className="w-10 h-10 rounded-full object-cover group-hover/ct:ring-2 group-hover/ct:ring-[#FFCC2D]/50 transition-all"
                                      />
                                      {c.online && (
                                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0a0a0a]" />
                                      )}
                                    </div>
                                    <div className="flex flex-col items-center">
                                      <span className="text-[9px] text-gray-400 group-hover/ct:text-white transition-colors leading-none">
                                        {c.name.split(" ")[0]}
                                      </span>
                                    </div>
                                    {/* Hover call icon */}
                                    <div className="opacity-0 group-hover/ct:opacity-100 transition-opacity -mt-0.5">
                                      {callTab === "voice"
                                        ? <Phone className="w-3 h-3 text-[#FFCC2D]" />
                                        : <Video className="w-3 h-3 text-[#FFCC2D]" />
                                      }
                                    </div>
                                  </button>
                                ))}
                            </div>
                          </div>
                        </div>

                        {/* Recent calls */}
                        <div className="px-4 pt-3">
                          <div className="text-[9px] uppercase tracking-widest text-gray-500 mb-2">
                            Recent
                          </div>
                          {RECENT_CALLS[callTab].map((c) => (
                            <div
                              key={c.id}
                              className="flex items-center gap-3 py-2.5 border-b border-white/[0.04] last:border-0"
                            >
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold ${
                                  c.missed
                                    ? "bg-rose-500/10 text-rose-400"
                                    : "bg-white/[0.06] text-gray-300"
                                }`}
                              >
                                {c.name[0].toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[12px] text-white truncate">{c.name}</div>
                                <div className={`flex items-center gap-1 text-[10px] ${c.missed ? "text-rose-400" : "text-gray-500"}`}>
                                  {c.missed && <PhoneMissed className="w-2.5 h-2.5" />}
                                  {c.missed ? `Missed · ${c.when}` : `${c.duration} · ${c.when}`}
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button className="w-7 h-7 flex items-center justify-center border border-white/[0.08] hover:bg-[#FFCC2D]/[0.08] hover:border-[#FFCC2D]/30 hover:text-[#FFCC2D] text-gray-500 transition-colors" title="Voice call">
                                  <Phone className="w-3 h-3" />
                                </button>
                                <button className="w-7 h-7 flex items-center justify-center border border-white/[0.08] hover:bg-[#FFCC2D]/[0.08] hover:border-[#FFCC2D]/30 hover:text-[#FFCC2D] text-gray-500 transition-colors" title="Video call">
                                  <Video className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* ── Messages tab ── */}
                    {callTab === "messages" && (
                      <div>
                        {MESSAGES_PREVIEW
                          .filter((m) =>
                            contactSearch
                              ? m.name.toLowerCase().includes(contactSearch.toLowerCase())
                              : true
                          )
                          .map((m) => (
                            <div
                              key={m.id}
                              className="flex items-start gap-3 px-4 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer"
                            >
                              <div className="relative shrink-0">
                                <Image
                                  src={m.avatar}
                                  alt={m.name}
                                  width={36}
                                  height={36}
                                  className="w-9 h-9 rounded-full object-cover"
                                />
                                {m.online && (
                                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0a0a0a]" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-0.5">
                                  <span className={`text-[12px] font-medium truncate ${m.unread ? "text-white" : "text-gray-400"}`}>
                                    {m.name}
                                  </span>
                                  <span className="text-[10px] text-gray-600 shrink-0">{m.when}</span>
                                </div>
                                <div className="text-[11px] text-gray-500 truncate">{m.preview}</div>
                              </div>
                              {m.unread > 0 && (
                                <div className="w-4 h-4 rounded-full bg-[#FFCC2D] flex items-center justify-center text-[8px] font-bold text-black shrink-0 mt-0.5">
                                  {m.unread}
                                </div>
                              )}
                              <div className="flex items-center gap-1 shrink-0 ml-auto pl-2">
                                <button className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-[#FFCC2D] transition-colors" title="Voice call">
                                  <Phone className="w-3 h-3" />
                                </button>
                                <button className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-[#FFCC2D] transition-colors" title="Video call">
                                  <Video className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-2.5 border-t border-white/[0.08] shrink-0 flex items-center justify-between">
                    <span className="text-[10px] text-gray-600 uppercase tracking-widest">
                      {CONTACTS.filter((c) => c.online).length} contacts online
                    </span>
                    <a
                      href="https://community.worldstreetgold.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-[#FFCC2D] hover:underline uppercase tracking-widest"
                    >
                      Open Community ↗
                    </a>
                  </div>
                </div>
              )}
            </div>

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
              <p className="text-[13px] text-gray-500 mt-1.5 font-body">
                Pick a platform to dive into. Everything from your trading desk to your stream room is one click away.
              </p>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-body">
              {welcomePlatforms.length} platforms
            </span>
          </div>

          {/* ── Platform quick-nav grid ── */}
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 border-t border-l border-white/[0.08] mb-10">
            {welcomePlatforms.map((p) => {
              const PIcon = p.icon;
              const inner = (
                <>
                  <div className="w-10 h-10 rounded-md bg-white/[0.04] flex items-center justify-center mb-2.5 group-hover:bg-[#FFCC2D]/[0.06] transition-colors">
                    <PIcon className="w-5 h-5 text-[#FFCC2D]" strokeWidth={1.5} />
                  </div>
                  <span className="text-[11px] font-medium text-gray-400 group-hover:text-white transition-colors text-center leading-snug">
                    {p.name.replace("Worldstreet ", "")}
                  </span>
                  {p.comingSoon && (
                    <span className="mt-1 text-[8px] uppercase tracking-widest text-gray-600">Soon</span>
                  )}
                </>
              );
              const cls = "group flex flex-col items-center justify-center py-5 px-3 border-r border-b border-white/[0.08] hover:bg-white/[0.03] transition-colors";
              return p.external ? (
                <a key={p.id} href={p.href} target="_blank" rel="noopener noreferrer" className={cls}>
                  {inner}
                </a>
              ) : (
                <Link key={p.id} href={p.href} className={cls}>
                  {inner}
                </Link>
              );
            })}
          </div>

          {/* ── Detailed platform cards (scroll for more detail) ── */}
          <div
            key={assetClass}
            ref={panelRef}
            className="border-t border-l border-white/[0.08]"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {welcomePlatforms.map((platform, i) => (
                <div
                  key={platform.id}
                  className="border-r border-b border-white/[0.08]"
                  style={{ backgroundColor: platform.cardColor }}
                >
                  <PlatformPreviewCard platform={platform} index={i} assetClass={assetClass} />
                </div>
              ))}
            </div>
          </div>

          {/* Footer hint */}
          <div className="mt-6 flex items-center justify-between text-[10px] uppercase tracking-widest text-gray-500 font-body">
            <span>One platform · New world economy</span>
            <Link href="/" className="hover:text-white transition-colors">
              ← Back to landing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
