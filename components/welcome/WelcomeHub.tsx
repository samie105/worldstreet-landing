"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOut, Phone, Video, MessageSquare, Search, X, PhoneMissed } from "lucide-react";
import BalanceHero from "./BalanceHero";
import PlatformPreviewCard from "./PlatformPreviewCard";
import { welcomePlatforms, type AssetClass } from "./welcome-platforms-data";
import { useClerk } from "@clerk/nextjs";
import { useGlobalCall } from "@/components/community/incoming-call-provider";
import {
  getConversations,
  getRecentUsers,
  type ConversationWithDetails,
  type UserSearchResult,
} from "@/lib/community/actions/messages";
import { getRecentCalls, type RecentCallItem } from "@/lib/community/actions/calls";
import type { WalletAddresses } from "@/lib/balance-actions";
import type { ReltrixForexSnapshot } from "@/lib/reltrix-actions";
import { avatarUrl } from "@/lib/utils";

// ── helpers ──────────────────────────────────────────────────────────────────

function timeAgo(date: Date): string {
  const diffMs = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

function fmtDuration(seconds: number): string {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

type Props = {
  firstName: string;
  lastName: string;
  initials: string;
  imageUrl?: string;
  spotBalance?: number;
  walletAddresses?: WalletAddresses;
  reltrixForexSnapshot?: ReltrixForexSnapshot;
};

const ASSET_TABS: { key: AssetClass; label: string }[] = [
  { key: "fiat", label: "Fiat" },
  { key: "crypto", label: "Crypto" },
  { key: "forex", label: "Forex" },
];

export default function WelcomeHub({
  firstName,
  lastName,
  initials,
  imageUrl,
  spotBalance = 0,
  walletAddresses = { tron: "", solana: "", ethereum: "" },
  reltrixForexSnapshot,
}: Props) {
  const { signOut } = useClerk();
  const router = useRouter();
  const { startCall } = useGlobalCall();
  const greetingRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState<string>("");
  const [assetClass, setAssetClass] = useState<AssetClass>("fiat");

  const [callsOpen, setCallsOpen] = useState(false);
  const [callTab, setCallTab] = useState<"voice" | "video" | "messages">("voice");
  const [contactSearch, setContactSearch] = useState("");

  // ── Real data ──────────────────────────────────────────────────────────────
  const [contacts, setContacts] = useState<UserSearchResult[]>([]);
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [recentCalls, setRecentCalls] = useState<RecentCallItem[]>([]);

  const loadCommunityData = useCallback(async () => {
    const [convResult, usersResult, callsResult] = await Promise.all([
      getConversations(),
      getRecentUsers(),
      getRecentCalls(),
    ]);
    if (convResult.success && convResult.conversations) setConversations(convResult.conversations);
    if (usersResult.success && usersResult.users) setContacts(usersResult.users);
    if (callsResult.success && callsResult.calls) setRecentCalls(callsResult.calls);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadCommunityData);

    // Re-fetch when tab regains focus (e.g. returning from /community page)
    const onVisible = () => {
      if (document.visibilityState === "visible") loadCommunityData();
    };
    document.addEventListener("visibilitychange", onVisible);

    // Also poll every 30s so conversation list stays fresh
    const interval = setInterval(loadCommunityData, 30_000);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      clearInterval(interval);
    };
  }, [loadCommunityData]);

  // Reload community data whenever the popover opens
  useEffect(() => {
    if (callsOpen) void Promise.resolve().then(loadCommunityData);
  }, [callsOpen, loadCommunityData]);

  // Merge conversation participants + standalone contacts (deduped)
  const allContacts = (() => {
    const seen = new Set<string>();
    const merged: UserSearchResult[] = [];
    for (const conv of conversations) {
      if (!seen.has(conv.participant.id)) {
        seen.add(conv.participant.id);
        merged.push({ id: conv.participant.id, name: conv.participant.name, avatar: conv.participant.avatar });
      }
    }
    for (const c of contacts) {
      if (!seen.has(c.id)) {
        seen.add(c.id);
        merged.push(c);
      }
    }
    return merged;
  })();

  const filteredRecentCalls = recentCalls.filter(
    (c) => callTab === "voice" ? c.type === "audio" : c.type === "video",
  );

  const onlineCount = conversations.filter((c) => c.participant.isOnline).length;

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
                              {allContacts
                                .filter((c) =>
                                  contactSearch
                                    ? c.name.toLowerCase().includes(contactSearch.toLowerCase())
                                    : true
                                )
                                .map((c) => (
                                  <button
                                    key={c.id}
                                    onClick={() =>
                                      startCall({
                                        participantId: c.id,
                                        participantName: c.name,
                                        participantAvatar: c.avatar ?? undefined,
                                        callType: callTab === "voice" ? "audio" : "video",
                                      })
                                    }
                                    className="flex flex-col items-center gap-1.5 group/ct"
                                    title={`${callTab === "voice" ? "Call" : "Video call"} ${c.name}`}
                                  >
                                    <div className="relative">
                                      <Image
                                        src={avatarUrl(c.avatar, c.name)}
                                        alt={c.name}
                                        width={40}
                                        height={40}
                                        className="w-10 h-10 rounded-full object-cover group-hover/ct:ring-2 group-hover/ct:ring-[#FFCC2D]/50 transition-all"
                                      />
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
                              {allContacts.length === 0 && (
                                <span className="text-[11px] text-gray-600 py-2">No contacts yet</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Recent calls */}
                        <div className="px-4 pt-3">
                          <div className="text-[9px] uppercase tracking-widest text-gray-500 mb-2">
                            Recent
                          </div>
                          {filteredRecentCalls
                            .filter((c) =>
                              contactSearch
                                ? c.participantName.toLowerCase().includes(contactSearch.toLowerCase())
                                : true
                            )
                            .map((c) => {
                              const isMissed = c.status === "missed" || (c.status === "declined" && c.isCaller);
                              return (
                            <div
                              key={c.id}
                              className="flex items-center gap-3 py-2.5 border-b border-white/[0.04] last:border-0"
                            >
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold overflow-hidden ${
                                  isMissed
                                    ? "bg-rose-500/10 text-rose-400"
                                    : "bg-white/[0.06] text-gray-300"
                                }`}
                              >
                                {c.participantAvatar ? (
                                  <Image src={c.participantAvatar} alt={c.participantName} width={36} height={36} className="w-full h-full object-cover rounded-full" />
                                ) : (
                                  c.participantName[0].toUpperCase()
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[12px] text-white truncate">{c.participantName}</div>
                                <div className={`flex items-center gap-1 text-[10px] ${isMissed ? "text-rose-400" : "text-gray-500"}`}>
                                  {isMissed && <PhoneMissed className="w-2.5 h-2.5" />}
                                  {isMissed
                                    ? `Missed · ${timeAgo(c.createdAt)}`
                                    : `${fmtDuration(c.duration)} · ${timeAgo(c.createdAt)}`}
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={() => startCall({ participantId: c.participantId, participantName: c.participantName, participantAvatar: c.participantAvatar ?? undefined, callType: "audio" })}
                                  className="w-7 h-7 flex items-center justify-center border border-white/[0.08] hover:bg-[#FFCC2D]/[0.08] hover:border-[#FFCC2D]/30 hover:text-[#FFCC2D] text-gray-500 transition-colors"
                                  title="Voice call"
                                >
                                  <Phone className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => startCall({ participantId: c.participantId, participantName: c.participantName, participantAvatar: c.participantAvatar ?? undefined, callType: "video" })}
                                  className="w-7 h-7 flex items-center justify-center border border-white/[0.08] hover:bg-[#FFCC2D]/[0.08] hover:border-[#FFCC2D]/30 hover:text-[#FFCC2D] text-gray-500 transition-colors"
                                  title="Video call"
                                >
                                  <Video className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            );
                          })}
                          {filteredRecentCalls.length === 0 && (
                            <p className="text-[11px] text-gray-600 py-4 text-center">No recent {callTab} calls</p>
                          )}
                        </div>
                      </>
                    )}

                    {callTab === "messages" && (
                      <div>
                        {conversations
                          .filter((m) =>
                            contactSearch
                              ? m.participant.name.toLowerCase().includes(contactSearch.toLowerCase())
                              : true
                          )
                          .map((conv) => (
                            <div
                              key={conv.id}
                              onClick={() => { router.push(`/community`); setCallsOpen(false); }}
                              className="flex items-start gap-3 px-4 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer"
                            >
                              <div className="relative shrink-0">
                                <Image
                                  src={avatarUrl(conv.participant.avatar, conv.participant.name)}
                                  alt={conv.participant.name}
                                  width={36}
                                  height={36}
                                  className="w-9 h-9 rounded-full object-cover"
                                />
                                {conv.participant.isOnline && (
                                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0a0a0a]" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-0.5">
                                  <span className={`text-[12px] font-medium truncate ${conv.unreadCount ? "text-white" : "text-gray-400"}`}>
                                    {conv.participant.name}
                                  </span>
                                  <span className="text-[10px] text-gray-600 shrink-0">{timeAgo(conv.lastMessageAt)}</span>
                                </div>
                                <div className="text-[11px] text-gray-500 truncate">{conv.lastMessage || "No messages yet"}</div>
                              </div>
                              {conv.unreadCount > 0 && (
                                <div className="w-4 h-4 rounded-full bg-[#FFCC2D] flex items-center justify-center text-[8px] font-bold text-black shrink-0 mt-0.5">
                                  {conv.unreadCount}
                                </div>
                              )}
                              <div className="flex items-center gap-1 shrink-0 ml-auto pl-2">
                                <button
                                  onClick={(e) => { e.stopPropagation(); startCall({ participantId: conv.participant.id, participantName: conv.participant.name, participantAvatar: conv.participant.avatar ?? undefined, callType: "audio" }); }}
                                  className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-[#FFCC2D] transition-colors"
                                  title="Voice call"
                                >
                                  <Phone className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); startCall({ participantId: conv.participant.id, participantName: conv.participant.name, participantAvatar: conv.participant.avatar ?? undefined, callType: "video" }); }}
                                  className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-[#FFCC2D] transition-colors"
                                  title="Video call"
                                >
                                  <Video className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        {conversations.length === 0 && (
                          <p className="text-[11px] text-gray-600 py-4 text-center px-4">No conversations yet. Go to Community to start chatting.</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-2.5 border-t border-white/[0.08] shrink-0 flex items-center justify-between">
                    <span className="text-[10px] text-gray-600 uppercase tracking-widest">
                      {onlineCount} contacts online
                    </span>
                    <span className="text-[10px] text-gray-600 uppercase tracking-widest">
                      Community lives here
                    </span>
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
            <BalanceHero
              assetClass={assetClass}
              spotBalance={spotBalance}
              walletAddresses={walletAddresses}
              reltrixForexSnapshot={reltrixForexSnapshot}
            />
          </div>
        </div>
      </div>

      {/* ── Platforms grid ────────────────────────────────────── */}
      <div className="flex-1">
        <div className="max-w-[1240px] mx-auto px-6 md:px-10 pt-10 md:pt-12 pb-16">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
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
          <div className="mb-10 grid grid-cols-3 border-t border-l border-white/[0.08] sm:grid-cols-5 md:hidden">
            {welcomePlatforms.map((p) => {
              const PIcon = p.icon;
              const hasLink = Boolean(p.href);
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
              const cls = `group flex flex-col items-center justify-center py-5 px-3 border-r border-b border-white/[0.08] transition-colors ${hasLink ? "hover:bg-white/[0.03]" : ""}`;
              return hasLink && p.external ? (
                <a key={p.id} href={p.href} target="_blank" rel="noopener noreferrer" className={cls}>
                  {inner}
                </a>
              ) : hasLink ? (
                <Link key={p.id} href={p.href!} className={cls}>
                  {inner}
                </Link>
              ) : (
                <div key={p.id} className={cls}>
                  {inner}
                </div>
              );
            })}
          </div>

          {/* ── Detailed platform cards (scroll for more detail) ── */}
          <div
            key={assetClass}
            ref={panelRef}
            className="hidden border-t border-l border-white/[0.08] md:block"
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
