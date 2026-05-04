import {
  LineChart,
  ShoppingBag,
  Sparkles,
  Tv,
  Users,
  GraduationCap,
  Radio,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";

export type AssetClass = "crypto" | "forex" | "fiat";

export type Notification = {
  id: string;
  text: string;
  meta: string;
  tone: "positive" | "negative" | "neutral" | "info";
  when: string;
};

export type VideoItem = {
  id: string;
  title: string;
  host: string;
  duration: string;
  live?: boolean;
  viewers?: string;
  thumbnail: string;
};

export type Course = {
  id: string;
  title: string;
  lessons: string;
  progress: number;
  thumbnail: string;
};

export type ShopItem = {
  id: string;
  name: string;
  price: string;
  category: string;
  thumbnail: string;
};

export type Trade = {
  id: string;
  pair: string;
  side: "buy" | "sell";
  size: string;
  pnl: string;
  pnlPositive: boolean;
  when: string;
};

export type SocialPost = {
  id: string;
  author: string;
  handle: string;
  text: string;
  likes: string;
  when: string;
};

export type CallItem = {
  id: string;
  name: string;
  type: "video" | "voice";
  missed: boolean;
  when: string;
  duration?: string;
};

export type ChatMessage = {
  id: string;
  author: string;
  text: string;
  when: string;
  unread?: boolean;
};

export type AiConversation = {
  id: string;
  title: string;
  preview: string;
  when: string;
  active?: boolean;
  fromUser?: boolean; // true = last message was from user
};

export type AssetTradingData = {
  primaryValue: string;
  status: { label: string; tone: "positive" | "negative" | "neutral" };
  sparkline: number[];
  history: Trade[];
};

export type WelcomePlatform = {
  id: string;
  name: string;
  tagline: string;
  href: string;
  external?: boolean;
  comingSoon?: boolean;
  spotOnly?: boolean; // hide content + zero metrics on crypto/forex tabs
  accent: string;
  icon: LucideIcon;
  primaryLabel: string;
  primaryValue: string;
  status: { label: string; tone: "positive" | "negative" | "neutral" };
  byAsset?: Record<AssetClass, AssetTradingData>;
  history?: Trade[];
  sparkline?: number[];
  videos?: VideoItem[];
  courses?: Course[];
  shopItems?: ShopItem[];
  posts?: SocialPost[];
  calls?: CallItem[];
  messages?: ChatMessage[];
  conversations?: AiConversation[];
  notifications: Notification[];
};

const spark = (start: number, vol: number, drift: number, seed = 0) => {
  const out: number[] = [];
  let v = start;
  for (let i = 0; i < 24; i++) {
    v += Math.sin(i * 0.7 + start + seed) * vol + drift + Math.cos(i * 1.3 + seed) * vol * 0.4;
    out.push(Math.max(v, start * 0.4));
  }
  return out;
};

// Per-asset-class trading data
export const tradingByAsset: Record<AssetClass, AssetTradingData> = {
  crypto: {
    primaryValue: "+$22,140.50",
    status: { label: "+4.82% today", tone: "positive" },
    sparkline: spark(60, 8, 1.4, 0),
    history: [
      { id: "c1", pair: "BTC/USDT", side: "buy", size: "0.18 BTC", pnl: "+$1,140", pnlPositive: true, when: "2m" },
      { id: "c2", pair: "ETH/USDT", side: "sell", size: "1.2 ETH", pnl: "+$420", pnlPositive: true, when: "18m" },
      { id: "c3", pair: "SOL/USDT", side: "buy", size: "32 SOL", pnl: "-$84", pnlPositive: false, when: "1h" },
      { id: "c4", pair: "AVAX/USDT", side: "sell", size: "120 AVAX", pnl: "+$240", pnlPositive: true, when: "3h" },
    ],
  },
  forex: {
    primaryValue: "+$3,820.40",
    status: { label: "+1.24% today", tone: "positive" },
    sparkline: spark(40, 3, 0.6, 7),
    history: [
      { id: "f1", pair: "EUR/USD", side: "buy", size: "0.8 lot", pnl: "+$320", pnlPositive: true, when: "12m" },
      { id: "f2", pair: "GBP/JPY", side: "sell", size: "1.2 lot", pnl: "+$184", pnlPositive: true, when: "42m" },
      { id: "f3", pair: "USD/CHF", side: "buy", size: "0.5 lot", pnl: "-$48", pnlPositive: false, when: "2h" },
      { id: "f4", pair: "AUD/USD", side: "sell", size: "0.4 lot", pnl: "+$72", pnlPositive: true, when: "4h" },
    ],
  },
  fiat: {
    primaryValue: "$48,210.00",
    status: { label: "Stable", tone: "neutral" },
    sparkline: spark(30, 1, 0.05, 3),
    history: [
      { id: "fi1", pair: "USD → NGN", side: "sell", size: "$2,000", pnl: "₦3.18M", pnlPositive: true, when: "8m" },
      { id: "fi2", pair: "GBP → USD", side: "buy", size: "£800", pnl: "$1,012", pnlPositive: true, when: "1h" },
      { id: "fi3", pair: "EUR → USD", side: "sell", size: "€1,500", pnl: "$1,620", pnlPositive: true, when: "3h" },
      { id: "fi4", pair: "USD → KES", side: "sell", size: "$500", pnl: "KSh 64,500", pnlPositive: true, when: "5h" },
    ],
  },
};

const T = {
  vision1: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80",
  vision2: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&q=80",
  vision3: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&q=80",
  vision4: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=400&q=80",
  xtreme1: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&q=80",
  xtreme2: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&q=80",
  xtreme3: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&q=80",
  xtreme4: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&q=80",
  course1: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&q=80",
  course2: "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=400&q=80",
  course3: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80",
  course4: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&q=80",
  shop1: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80",
  shop2: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&q=80",
  shop3: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80",
  shop4: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
};

export const welcomePlatforms: WelcomePlatform[] = [
  {
    id: "trading",
    name: "Trading",
    tagline: "Spot · Futures · Forex · P2P",
    href: "/trading",
    accent: "#FFCC2D",
    icon: LineChart,
    primaryLabel: "Open P&L",
    primaryValue: tradingByAsset.crypto.primaryValue,
    status: tradingByAsset.crypto.status,
    sparkline: tradingByAsset.crypto.sparkline,
    history: tradingByAsset.crypto.history,
    byAsset: tradingByAsset,
    notifications: [],
  },
  {
    id: "community",
    name: "Community",
    tagline: "Calls · Messages · Groups",
    href: "https://community.worldstreetgold.com",
    external: true,
    accent: "#FFCC2D",
    icon: Users,
    primaryLabel: "Unread",
    primaryValue: "4 missed",
    status: { label: "12 online now", tone: "positive" },
    calls: [
      { id: "cl1", name: "Trader Jay", type: "video", missed: true, when: "5m ago" },
      { id: "cl2", name: "Sarah Chen", type: "voice", missed: true, when: "22m ago" },
      { id: "cl3", name: "Mike Thorne", type: "video", missed: false, duration: "8m 42s", when: "1h ago" },
      { id: "cl4", name: "NG Forex Group", type: "voice", missed: false, duration: "24m", when: "3h ago" },
    ],
    messages: [
      { id: "msg1", author: "Kelly", text: "Anyone watching SUI? Looking primed for a breakout.", when: "3m", unread: true },
      { id: "msg2", author: "Spot Traders", text: "New trade alert posted in the group — BTC long signal.", when: "18m", unread: true },
      { id: "msg3", author: "Lola (Admin)", text: "Welcome to NG Forex! Post your setups here.", when: "1h" },
    ],
    notifications: [],
  },
  {
    id: "vivid",
    name: "Vivid AI",
    tagline: "Ask anything · Research · Insights",
    href: "/vivid",
    accent: "#FFCC2D",
    icon: Sparkles,
    primaryLabel: "Conversations",
    primaryValue: "5 sessions",
    status: { label: "3 active today", tone: "positive" },
    conversations: [
      {
        id: "ai1",
        title: "Is BTC decoupling from macro in 2025?",
        preview: "Yes — the correlation with US equities has dropped sharply since Q1…",
        when: "just now",
        active: true,
      },
      {
        id: "ai2",
        title: "Review my EUR/USD swing trade setup",
        preview: "Your entry looks solid, but the stop is too tight given the current ATR…",
        when: "2h",
      },
      {
        id: "ai3",
        title: "What is the carry trade and how does it work?",
        preview: "The carry trade is borrowing in a low-yield currency and investing in a higher-yield one…",
        when: "yesterday",
      },
      {
        id: "ai4",
        title: "Best time zones to trade gold this week?",
        preview: "Watch the London open and Tuesday's US CPI — gold tends to spike on…",
        when: "2d",
      },
      {
        id: "ai5",
        title: "Explain order blocks and how to mark them",
        preview: "An order block is the last opposing candle before a strong impulse move…",
        when: "3d",
        fromUser: true,
      },
    ],
    notifications: [],
  },
  {
    id: "vision",
    name: "Worldstreet Vision",
    tagline: "Trading films · Documentaries · Series",
    href: "https://vision.worldstreetgold.com",
    external: true,
    accent: "#FFCC2D",
    icon: Tv,
    primaryLabel: "Continue watching",
    primaryValue: "3 saved",
    status: { label: "6 new titles added", tone: "positive" },
    videos: [
      { id: "vi1", title: "The Trading Floor", host: "Drama · 1h 42m", duration: "74%", thumbnail: T.vision1 },
      { id: "vi2", title: "Inside the Bull Run", host: "Documentary · 58m", duration: "New", thumbnail: T.vision2 },
      { id: "vi3", title: "Forex: The Last Frontier", host: "Series · S1 E3", duration: "New", thumbnail: T.vision3 },
      { id: "vi4", title: "Market Makers", host: "Documentary · 1h 12m", duration: "New", thumbnail: T.vision4 },
    ],
    notifications: [],
  },
  {
    id: "xtreme",
    name: "Worldstreet Xtreme",
    tagline: "Live trading floors · Scalping",
    href: "https://xtreme.worldstreetgold.com",
    external: true,
    accent: "#FFCC2D",
    icon: Radio,
    primaryLabel: "Active rooms",
    primaryValue: "5 live floors",
    status: { label: "3.4K live now", tone: "positive" },
    videos: [
      { id: "x1", title: "BTC Scalping Floor", host: "Mike Thorne", duration: "Live", live: true, viewers: "1.2K", thumbnail: T.xtreme1 },
      { id: "x2", title: "Forex London Open", host: "Lisa Vance", duration: "Live", live: true, viewers: "842", thumbnail: T.xtreme2 },
      { id: "x3", title: "NY Futures Pit", host: "Carlos R.", duration: "Live", live: true, viewers: "612", thumbnail: T.xtreme3 },
      { id: "x4", title: "Asia Crypto Late", host: "Yuki T.", duration: "Live", live: true, viewers: "318", thumbnail: T.xtreme4 },
    ],
    notifications: [],
  },
  {
    id: "academy",
    name: "Academy",
    tagline: "Courses, certifications & mentors",
    href: "https://academy.worldstreetgold.com",
    external: true,
    accent: "#FFCC2D",
    icon: GraduationCap,
    primaryLabel: "In progress",
    primaryValue: "2 courses",
    status: { label: "68% complete", tone: "positive" },
    courses: [
      { id: "co1", title: "Trading Foundations", lessons: "12 lessons", progress: 78, thumbnail: T.course1 },
      { id: "co2", title: "Risk Management Pro", lessons: "8 lessons", progress: 42, thumbnail: T.course2 },
      { id: "co3", title: "Crypto Markets 101", lessons: "16 lessons", progress: 100, thumbnail: T.course3 },
      { id: "co4", title: "Advanced Forex", lessons: "20 lessons", progress: 14, thumbnail: T.course4 },
    ],
    notifications: [],
  },
  {
    id: "shop",
    name: "Shop",
    tagline: "Storefronts · Orders · Listings",
    href: "https://shop.worldstreetgold.com",
    external: true,
    spotOnly: true,
    accent: "#FFCC2D",
    icon: ShoppingBag,
    primaryLabel: "Sales (30d)",
    primaryValue: "$8,765.20",
    status: { label: "+12.4%", tone: "positive" },
    shopItems: [
      { id: "s1", name: "Cold-pressed Olive Oil", price: "$24.99", category: "Food", thumbnail: T.shop1 },
      { id: "s2", name: "Trading Journal", price: "$18.00", category: "Stationery", thumbnail: T.shop2 },
      { id: "s3", name: "WS Cap — Black", price: "$32.00", category: "Apparel", thumbnail: T.shop3 },
      { id: "s4", name: "Desk Mat XL", price: "$44.00", category: "Accessories", thumbnail: T.shop4 },
    ],
    notifications: [],
  },
  {
    id: "social",
    name: "Worldstreet Social",
    tagline: "Posts, signals & creator feed",
    href: "https://social.worldstreetgold.com",
    external: true,
    spotOnly: true,
    accent: "#FFCC2D",
    icon: MessageCircle,
    primaryLabel: "Engagement",
    primaryValue: "+1,840 this week",
    status: { label: "Rank #142", tone: "positive" },
    posts: [
      { id: "p1", author: "Trader Jay", handle: "@trader_jay", text: "BTC printing weekly higher highs — keep an eye on the 72k flip.", likes: "248", when: "12m" },
      { id: "p2", author: "Sarah Chen", handle: "@sarahc", text: "Macro recap from this morning is up. Fed in focus this week.", likes: "184", when: "1h" },
      { id: "p3", author: "Mike Thorne", handle: "@mscalp", text: "Live floor open — running BTC scalps for the next hour.", likes: "92", when: "2h" },
    ],
    notifications: [],
  },
];
