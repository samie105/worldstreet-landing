"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ArrowUpRight, ArrowDownRight, ArrowRight, Play, Heart, Phone, Video, PhoneMissed, Sparkles, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Sparkline from "../platform-balances/Sparkline";
import type { WelcomePlatform, AssetClass } from "./welcome-platforms-data";

interface Props {
  platform: WelcomePlatform;
  index: number;
  assetClass: AssetClass;
}

export default function PlatformPreviewCard({ platform, index, assetClass }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const dynamicRef = useRef<HTMLDivElement>(null);
  const Icon = platform.icon;

  // For Trading: pick per-asset-class data when available
  const tradingData = platform.byAsset?.[assetClass];
  const primaryValue = tradingData?.primaryValue ?? platform.primaryValue;
  const status = tradingData?.status ?? platform.status;
  const sparkline = tradingData?.sparkline ?? platform.sparkline;
  const history = tradingData?.history ?? platform.history;

  // Spot-only platforms (Shop, Social, Community) show zero state on crypto/forex tabs
  const isZeroed = !!platform.spotOnly && assetClass !== "fiat";

  // Initial entrance stagger
  useEffect(() => {
    if (!cardRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(cardRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.55,
        delay: 0.1 + index * 0.06,
        ease: "power3.out",
      });
    }, cardRef);
    return () => ctx.revert();
  }, [index]);

  // Re-animate the dynamic content when assetClass changes (Trading card)
  useEffect(() => {
    if (!platform.byAsset || !dynamicRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(dynamicRef.current, {
        opacity: 0,
        y: 12,
        duration: 0.5,
        ease: "power3.out",
      });
      gsap.from("[data-trade-row]", {
        opacity: 0,
        x: -10,
        duration: 0.4,
        stagger: 0.05,
        delay: 0.1,
        ease: "power2.out",
      });
    }, dynamicRef);
    return () => ctx.revert();
  }, [assetClass, platform.byAsset]);

  const positive = status.tone === "positive";
  const negative = status.tone === "negative";

  const cta = (
    <span
      className="inline-flex items-center gap-1.5 text-[12px] font-medium transition-all group-hover/cta:gap-2.5"
      style={{ color: platform.accent }}
    >
      Open {platform.name}
      <ArrowRight className="w-3.5 h-3.5" />
    </span>
  );

  return (
    <div ref={cardRef} className="group relative flex flex-col h-full transition-colors hover:bg-white/[0.025]">

      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
            <Icon className="w-4 h-4 text-[#FFCC2D]" strokeWidth={1.6} />
          </div>
          <div>
            <h3 className="text-[14px] font-medium text-white tracking-tight">{platform.name}</h3>
            <p className="text-[11px] text-gray-500 font-body">{platform.tagline}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {platform.comingSoon && (
            <span className="px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase border border-white/10 text-gray-500">
              Soon
            </span>
          )}
          {/* Arrow — always on mobile, hover on desktop */}
          {platform.external ? (
            <a
              href={platform.href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 flex items-center justify-center text-[#FFCC2D] opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
              aria-label={`Open ${platform.name}`}
              onClick={(e) => e.stopPropagation()}
            >
              <ArrowUpRight className="w-4 h-4" />
            </a>
          ) : (
            <Link
              href={platform.href}
              className="w-7 h-7 flex items-center justify-center text-[#FFCC2D] opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
              aria-label={`Open ${platform.name}`}
              onClick={(e) => e.stopPropagation()}
            >
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Primary metric (dynamic for Trading) */}
      <div ref={dynamicRef} className="px-6 pb-4">
        <div className="text-[9px] uppercase tracking-widest text-gray-500 font-body mb-1">
          {platform.primaryLabel}
          {platform.byAsset && (
            <span className="ml-2 text-[#FFCC2D]/70">· {assetClass}</span>
          )}
        </div>
        <div className="flex items-end gap-3">
          <div className={`text-[24px] font-medium tabular-nums tracking-tight leading-none ${isZeroed ? "text-gray-700" : "text-white"}`}>
            {isZeroed ? "—" : primaryValue}
          </div>
          <span
            className={`mb-0.5 inline-flex items-center gap-0.5 text-[11px] font-medium ${
              isZeroed ? "text-gray-700" : positive ? "text-emerald-400" : negative ? "text-rose-400" : "text-gray-400"
            }`}
          >
            {!isZeroed && positive && <ArrowUpRight className="w-3 h-3" />}
            {!isZeroed && negative && <ArrowDownRight className="w-3 h-3" />}
            {isZeroed ? "Spot only" : status.label}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col">
        {/* Trading: chart + history */}
        {platform.byAsset && sparkline && (
          <>
            <div className="px-6 pb-3 opacity-80">
              <Sparkline data={sparkline} accent="#FFCC2D" height={48} animateKey={`${platform.id}-${assetClass}`} />
            </div>
            <div className="px-6 pb-5">
              <div className="text-[9px] uppercase tracking-widest text-gray-500 font-body mb-2">
                Recent trades
              </div>
              <div className="border border-white/[0.06]">
                {history?.slice(0, 4).map((t) => (
                  <div
                    key={t.id}
                    data-trade-row
                    className="flex items-center justify-between px-3 py-2 border-b border-white/[0.04] last:border-0 bg-[#050505]"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 ${
                          t.side === "buy" ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {t.side}
                      </span>
                      <span className="text-[12px] text-white truncate">{t.pair}</span>
                      <span className="text-[10px] text-gray-500 truncate hidden sm:inline">{t.size}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`text-[12px] font-medium tabular-nums ${
                          t.pnlPositive ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {t.pnl}
                      </span>
                      <span className="text-[10px] text-gray-600 tabular-nums w-7 text-right">{t.when}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Vision / Xtreme: horizontal video carousel with fade mask */}
        {!isZeroed && platform.videos && (
          <div className="relative pb-5">
            <div className="overflow-x-auto scrollbar-hide px-6">
              <div className="flex gap-3 pb-1" style={{ width: "max-content" }}>
                {platform.videos.map((v) => (
                  <div key={v.id} className="w-44 shrink-0 group/v cursor-pointer">
                    <div className="relative aspect-video w-full overflow-hidden bg-white/[0.04] border border-white/[0.06]">
                      <Image
                        src={v.thumbnail}
                        alt={v.title}
                        fill
                        sizes="176px"
                        className="object-cover transition-transform duration-500 group-hover/v:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
                          <Play className="w-3.5 h-3.5 text-white fill-white" />
                        </div>
                      </div>
                      {v.live && (
                        <div className="absolute top-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 bg-rose-500 text-white text-[8px] font-bold uppercase tracking-wider">
                          <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                          Live
                        </div>
                      )}
                      <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/70 text-white text-[9px] font-medium tabular-nums">
                        {v.live ? `${v.viewers} watching` : v.duration}
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-[12px] text-white leading-snug truncate">{v.title}</div>
                      <div className="text-[10px] text-gray-500 truncate">{v.host}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Right fade mask */}
            <div className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-[#050505] to-transparent pointer-events-none" />
          </div>
        )}

        {/* Academy: horizontal course carousel */}
        {!isZeroed && platform.courses && (
          <div className="relative pb-5">
            <div className="overflow-x-auto scrollbar-hide px-6">
              <div className="flex gap-3 pb-1" style={{ width: "max-content" }}>
                {platform.courses.map((c) => (
                  <div key={c.id} className="w-40 shrink-0 group/c cursor-pointer">
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-white/[0.04] border border-white/[0.06]">
                      <Image
                        src={c.thumbnail}
                        alt={c.title}
                        fill
                        sizes="160px"
                        className="object-cover transition-transform duration-500 group-hover/c:scale-105"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10">
                        <div className="h-full bg-[#FFCC2D]" style={{ width: `${c.progress}%` }} />
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-[12px] text-white leading-snug truncate">{c.title}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        {c.lessons} · {c.progress}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-[#050505] to-transparent pointer-events-none" />
          </div>
        )}

        {/* Shop: horizontal product carousel */}
        {!isZeroed && platform.shopItems && (
          <div className="relative pb-5">
            <div className="overflow-x-auto scrollbar-hide px-6">
              <div className="flex gap-3 pb-1" style={{ width: "max-content" }}>
                {platform.shopItems.map((item) => (
                  <div key={item.id} className="w-36 shrink-0 group/s cursor-pointer">
                    <div className="relative aspect-square w-full overflow-hidden bg-white/[0.04] border border-white/[0.06]">
                      <Image
                        src={item.thumbnail}
                        alt={item.name}
                        fill
                        sizes="144px"
                        className="object-cover transition-transform duration-500 group-hover/s:scale-105"
                      />
                    </div>
                    <div className="mt-2">
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider truncate">
                        {item.category}
                      </div>
                      <div className="text-[12px] text-white leading-snug truncate">{item.name}</div>
                      <div className="text-[12px] font-medium text-white mt-0.5 tabular-nums">{item.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-[#050505] to-transparent pointer-events-none" />
          </div>
        )}

        {/* Community: missed calls */}
        {!isZeroed && platform.calls && (
          <div className="px-6 pb-4">
            <div className="text-[9px] uppercase tracking-widest text-gray-500 font-body mb-2">Missed calls</div>
            <div className="flex flex-col">
              {platform.calls
                .filter((c) => c.missed)
                .slice(0, 2)
                .map((c) => (
                  <div key={c.id} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
                    <div className="w-7 h-7 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0">
                      {c.type === "video" ? (
                        <Video className="w-3 h-3 text-rose-400" />
                      ) : (
                        <PhoneMissed className="w-3 h-3 text-rose-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] text-white truncate">{c.name}</div>
                      <div className="text-[10px] text-rose-400">Missed · {c.when}</div>
                    </div>
                    <button className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-[#FFCC2D] transition-colors shrink-0">
                      {c.type === "video" ? <Video className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Vivid AI / Community: messages */}
        {!isZeroed && platform.messages && (
          <div className="px-6 pb-5">
            {platform.calls && (
              <div className="text-[9px] uppercase tracking-widest text-gray-500 font-body mb-2">Recent messages</div>
            )}
            <div className="border border-white/[0.06]">
              {platform.messages.slice(0, 3).map((m) => (
                <div
                  key={m.id}
                  className="flex items-start gap-3 px-3 py-2.5 border-b border-white/[0.04] last:border-0 bg-[#050505]"
                >
                  <div className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0 text-[9px] font-bold text-gray-300 mt-0.5">
                    {m.author[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="text-[11px] font-medium text-white truncate">{m.author}</span>
                      <span className="text-[10px] text-gray-600 shrink-0">{m.when}</span>
                    </div>
                    <div className="text-[11px] text-gray-400 line-clamp-1">{m.text}</div>
                  </div>
                  {m.unread && <span className="w-1.5 h-1.5 rounded-full bg-[#FFCC2D] shrink-0 mt-2" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vivid AI: chatbot conversation history */}
        {!isZeroed && platform.conversations && (
          <div className="px-6 pb-5">
            <div className="flex items-center justify-between mb-2.5">
              <div className="text-[9px] uppercase tracking-widest text-gray-500 font-body">Recent chats</div>
              <button className="flex items-center gap-1 text-[9px] text-gray-500 hover:text-[#FFCC2D] transition-colors border border-white/[0.06] hover:border-[#FFCC2D]/30 px-1.5 py-0.5">
                <Plus className="w-2.5 h-2.5" />
                New chat
              </button>
            </div>
            <div className="flex flex-col gap-1">
              {platform.conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`group/conv flex items-start gap-2.5 px-3 py-2.5 cursor-pointer transition-colors ${
                    conv.active
                      ? "bg-[#FFCC2D]/[0.06] border border-[#FFCC2D]/20"
                      : "border border-transparent hover:bg-white/[0.03] hover:border-white/[0.06]"
                  }`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    conv.active ? "bg-[#FFCC2D]/15" : "bg-white/[0.06]"
                  }`}>
                    <Sparkles className={`w-2.5 h-2.5 ${
                      conv.active ? "text-[#FFCC2D]" : "text-gray-500"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className={`text-[12px] font-medium truncate ${
                        conv.active ? "text-white" : "text-gray-300"
                      }`}>
                        {conv.title}
                      </span>
                      <span className="text-[9px] text-gray-600 shrink-0 tabular-nums">{conv.when}</span>
                    </div>
                    <div className="text-[10px] text-gray-500 line-clamp-1 leading-snug">
                      <span className={conv.fromUser ? "text-gray-600" : "text-gray-500"}>
                        {conv.fromUser ? "You: " : "AI: "}
                      </span>
                      {conv.preview}
                    </div>
                  </div>
                  {conv.active && (
                    <div className="flex items-center gap-0.5 shrink-0 mt-1">
                      <span className="w-1 h-1 rounded-full bg-[#FFCC2D] animate-pulse" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {!isZeroed && platform.posts && (
          <div className="px-6 pb-5">
            <div className="border border-white/[0.06]">
              {platform.posts.map((p) => (
                <div key={p.id} className="px-3 py-3 border-b border-white/[0.04] last:border-0 bg-[#050505]">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[12px] text-white font-medium truncate">{p.author}</span>
                      <span className="text-[10px] text-gray-500 truncate">{p.handle}</span>
                    </div>
                    <span className="text-[10px] text-gray-600 shrink-0">{p.when}</span>
                  </div>
                  <div className="text-[12px] text-gray-300 leading-snug line-clamp-2">{p.text}</div>
                  <div className="mt-1.5 flex items-center gap-1 text-[10px] text-gray-500">
                    <Heart className="w-3 h-3" />
                    {p.likes}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Plain platforms: clean stat tiles */}
        {!isZeroed &&
          !platform.byAsset &&
          !platform.videos &&
          !platform.courses &&
          !platform.shopItems &&
          !platform.posts &&
          !platform.messages &&
          !platform.calls && (
            <div className="px-6 pb-5 grid grid-cols-2 gap-px border border-white/[0.06] mx-6 mb-1">
              {platform.notifications.slice(0, 2).map((n) => (
                <div key={n.id} className="bg-[#050505] px-3 py-3">
                  <div className="text-[10px] text-gray-500 truncate font-body">{n.meta}</div>
                  <div className="text-[12px] text-white truncate leading-snug mt-0.5">{n.text}</div>
                  <div className="text-[10px] text-gray-600 mt-1">{n.when}</div>
                </div>
              ))}
            </div>
          )}
        {/* Spot-only empty state */}
        {isZeroed && (
          <div className="flex-1 flex items-center justify-center px-6 py-10">
            <span className="text-[10px] uppercase tracking-widest text-gray-700 font-body">Available in Spot mode</span>
          </div>
        )}
      </div>

      {/* CTA */}
      {platform.external ? (
        <a
          href={platform.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex mx-6 mb-6 mt-2 pt-4 border-t border-white/[0.06] items-center justify-between group/cta"
        >
          {cta}
          <span className="text-[9px] uppercase tracking-widest text-gray-600">External ↗</span>
        </a>
      ) : (
        <Link
          href={platform.href}
          className="flex mx-6 mb-6 mt-2 pt-4 border-t border-white/[0.06] items-center justify-between group/cta"
        >
          {cta}
        </Link>
      )}
    </div>
  );
}
