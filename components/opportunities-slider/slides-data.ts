export const slides = [
  {
    title: "Cryptocurrencies",
    description:
      "TRADE CFDS ON POPULAR CRYPTOCURRENCIES INCLUDING BITCOIN, ETHEREUM, RIPPLE AND LITECOIN AGAINST THE WORLD'S DOMINANT CURRENCIES AND BUILD YOUR CRYPTO PORTFOLIO",
    image: "/attachments/crypto.jpeg",
    href: "/register",
    comingSoon: false,
  },
  {
    title: "Vivid AI",
    description:
      "AI-POWERED TRADING DECISIONS AND MARKET ANALYSIS. LET ARTIFICIAL INTELLIGENCE GUIDE YOUR TRADING STRATEGY",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    href: "/register",
    comingSoon: true,
  },
  {
    title: "e-Commerce",
    description:
      "ACCESS OUR PRODUCT MARKETPLACE. BUY AND SELL DIGITAL AND PHYSICAL GOODS IN OUR GROWING ECOSYSTEM",
    image: "/attachments/ecommerce.jpeg",
    href: "/register",
    comingSoon: false,
  },
  {
    title: "Forex Markets",
    description:
      "TRADE MAJOR AND MINOR CURRENCY PAIRS WITH TIGHT SPREADS, NAIRA DEPOSITS, AND $50 MINIMUM TO START",
    image: "/attachments/forex.jpeg",
    href: "/register",
    comingSoon: false,
  },
  {
    title: "Xtreme",
    description:
      "ENTERTAINMENT AND STREAMING PLATFORM. ACCESS EXCLUSIVE CONTENT AND CONNECT WITH THE COMMUNITY",
    image: "/attachments/streaming.jpeg",
    href: "/register",
    comingSoon: false,
  },
  {
    title: "Community",
    description:
      "JOIN THE CONVERSATION. CONNECT WITH FELLOW TRADERS, SHARE INSIGHTS, AND PARTICIPATE IN DISCUSSIONS TO GROW TOGETHER",
    image: "/attachments/community-bg.jpg",
    href: "/register",
    comingSoon: false,
  },
] as const;

export type Slide = (typeof slides)[number];
