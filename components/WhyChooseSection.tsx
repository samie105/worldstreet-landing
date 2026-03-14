"use client";

import { motion } from "framer-motion";
import { Home, Zap, Expand, Monitor } from "lucide-react";

const features = [
  {
    icon: <Home className="w-5 h-5 text-white" strokeWidth={1.5} />,
    title: "Maximum Security",
    description: "Your assets are protected with cutting-edge security protocols.",
  },
  {
    icon: <Zap className="w-5 h-5 text-white" strokeWidth={1.5} />,
    title: "Instant Transactions",
    description: "Execute your transactions in real-time, without delays.",
  },
  {
    icon: <Expand className="w-5 h-5 text-white" strokeWidth={1.5} />,
    title: "Optimized Fees",
    description: "Benefit from some of the lowest fees on the market.",
  },
  {
    icon: <Monitor className="w-5 h-5 text-white" strokeWidth={1.5} />,
    title: "Premium Interface",
    description: "An intuitive design that's easy to use, even for beginners.",
  },
];

const cryptos = [
  { name: "Bitcoin", price: "$64,230", change: "+1.71%", logo: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/btc.svg", positive: true },
  { name: "Solana", price: "$142.50", change: "-0.65%", logo: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/sol.svg", positive: false },
  { name: "Dash", price: "$28.90", change: "+1.71%", logo: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/dash.svg", positive: true },
  { name: "XRP", price: "$0.5240", change: "+1.66%", logo: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/xrp.svg", positive: true },
  { name: "Ethereum", price: "$3,450.20", change: "+1.80%", logo: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/eth.svg", positive: true },
  { name: "Polkadot", price: "$7.20", change: "-0.12%", logo: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/dot.svg", positive: false },
];

function CryptoChip({ name, price, change, logo, positive }: {
  name: string; price: string; change: string; logo: string; positive: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-full border border-white/5 bg-[#0a0a0a] shrink-0 min-w-[200px]">
      <div className="w-8 h-8 rounded-full bg-transparent flex items-center justify-center shrink-0 overflow-hidden">
        <img src={logo} alt={name} className="w-full h-full object-contain" />
      </div>
      <div className="flex flex-col w-full pr-2">
        <div className="font-medium text-white text-[13px] leading-tight">
          {name}
        </div>
        <div className="flex items-center gap-2 text-[11px] leading-tight mt-0.5">
          <span className="text-gray-400">{price}</span>
          <span className={positive ? "text-emerald-400" : "text-rose-400"}>{change}</span>
        </div>
      </div>
    </div>
  );
}

export default function WhyChooseSection() {
  return (
    <section className="relative z-10 bg-[#050505]">
      {/* Why Choose Header */}
      <div className="text-center pt-28 pb-16 px-6 relative z-10">
        <h2 className="text-3xl md:text-[40px] font-medium tracking-tight text-white mb-4">
          Why Choose Worldstreet?
        </h2>
        <p className="text-sm md:text-base text-gray-400 max-w-xl mx-auto leading-relaxed font-body">
          Benefits designed to provide a seamless, secure, and accessible experience for all users.
        </p>
      </div>

      {/* Structured Grid Framework */}
      <div className="w-full relative">
        
        {/* Full Bleed Top Horizontal Line */}
        <div className="w-full border-t border-white/[0.08]" />

        {/* Top Row - Feature Cards */}
        <div className="max-w-[1240px] mx-auto w-full border-x border-white/[0.08]">
          <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
            {features.map((feature, i) => (
              <div key={i} className="p-8 lg:p-10 xl:p-12 flex flex-col">
                <div className="w-[60px] h-[60px] rounded-full border border-white/10 flex items-center justify-center mb-8 bg-transparent">
                  {feature.icon}
                </div>
                <h3 className="text-[17px] font-medium text-white mb-3 tracking-wide">{feature.title}</h3>
                <p className="text-[14px] text-gray-400 leading-relaxed font-body">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Middle Horizontal Line connecting grid */}
        <div className="w-full border-t border-white/[0.08]" />

        {/* Empty Spanning Gap (Connected only by grid sidelines) */}
        <div className="max-w-[1240px] mx-auto w-full h-[100px] md:h-[160px] border-x border-white/[0.08] bg-[#050505]" />

        {/* Top Horizontal Line of the Bottom Row */}
        <div className="w-full border-t border-white/[0.08]" />

        {/* Bottom Row - All Cryptos, One Platform */}
        <div className="max-w-[1240px] mx-auto w-full border-x border-white/[0.08]">
          <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]">
            
            {/* Left Box text */}
            <div className="w-full lg:w-[45%] p-8 lg:p-16 xl:p-20 flex flex-col justify-center bg-[#050505] relative z-20">
              <h2 className="text-3xl md:text-[36px] font-medium text-white tracking-tight mb-5">
                All Cryptos, One Platform
              </h2>
              <p className="text-[15px] text-gray-400 leading-relaxed max-w-sm mb-10 font-body">
                Buy, sell, and convert all major cryptocurrencies on a single platform. A seamless experience with no compromises.
              </p>
              <div>
                <a href="#" className="inline-flex items-center gap-2 text-[#bdff00] text-[15px] font-medium hover:text-white transition-colors">
                  Buy crypto now
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>
                </a>
              </div>
            </div>

            {/* Right Box marquees (No lines running through here) */}
            <div className="w-full lg:w-[55%] py-10 relative overflow-hidden flex flex-col justify-center bg-[#050505] min-h-[400px]">
              {/* Fade Edges overlapping marquee but hidden correctly */}
              <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#050505] to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none" />

              <div className="flex flex-col gap-4 relative z-0 w-full overflow-hidden">
                {/* Row 1 - scrolls left */}
                <div className="flex w-max animate-marquee-left gap-4">
                  {[...cryptos, ...cryptos, ...cryptos].map((c, i) => <CryptoChip key={`r1-${i}`} {...c} />)}
                </div>

                {/* Row 2 - scrolls right */}
                <div className="flex w-max animate-marquee-right gap-4 ml-[-50%]">
                  {[...cryptos, ...cryptos, ...cryptos].map((c, i) => <CryptoChip key={`r2-${i}`} {...c} />)}
                </div>

                {/* Row 3 - scrolls left */}
                <div className="flex w-max animate-marquee-left gap-4 ml-[-20%]">
                  {[...cryptos, ...cryptos, ...cryptos].map((c, i) => <CryptoChip key={`r3-${i}`} {...c} />)}
                </div>

                {/* Row 4 - scrolls right */}
                <div className="flex w-max animate-marquee-right gap-4 ml-[-60%]">
                  {[...cryptos, ...cryptos, ...cryptos].map((c, i) => <CryptoChip key={`r4-${i}`} {...c} />)}
                </div>

                {/* Row 5 - scrolls left */}
                <div className="flex w-max animate-marquee-left gap-4 ml-[-35%]">
                  {[...cryptos, ...cryptos, ...cryptos].map((c, i) => <CryptoChip key={`r5-${i}`} {...c} />)}
                </div>

                {/* Row 6 - scrolls right */}
                <div className="flex w-max animate-marquee-right gap-4 ml-[-10%]">
                  {[...cryptos, ...cryptos, ...cryptos].map((c, i) => <CryptoChip key={`r6-${i}`} {...c} />)}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Full Bleed Bottom Horizontal Line */}
        <div className="w-full border-t border-white/[0.08]" />

      </div>
    </section>
  );
}
