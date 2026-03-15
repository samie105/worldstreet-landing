import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-[#050505] border-t border-[rgba(255,255,255,0.05)] text-gray-400">

      {/* Main link columns */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-10">

        {/* Brand */}
        <div className="col-span-2 sm:col-span-3 lg:col-span-2 flex flex-col">
          <Link href="/" className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 flex items-center justify-center">
              <img src="/worldstreet-logo/WorldStreet4.png" alt="Worldstreet Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-white">World</span><span className="text-[#FFCC2D]">Street</span><span className="text-white">.</span>
            </span>
          </Link>
          <p className="text-sm leading-relaxed text-gray-400 max-w-xs">
            Secure, fast, and seamless trading across Forex, Crypto, and global markets.
          </p>
        </div>

        {/* Markets */}
        <div className="flex flex-col gap-3">
          <h4 className="text-white text-sm font-semibold uppercase tracking-widest mb-1">Markets</h4>
          <Link href="/register" className="text-gray-400 hover:text-white transition-colors text-sm">Forex Trading</Link>
          <Link href="/register" className="text-gray-400 hover:text-white transition-colors text-sm">Cryptocurrencies</Link>
          <Link href="/register" className="text-gray-400 hover:text-white transition-colors text-sm">Commodities</Link>
          <Link href="/register" className="text-gray-400 hover:text-white transition-colors text-sm">Stock Indices</Link>
          <Link href="/register" className="text-gray-400 hover:text-white transition-colors text-sm">CFDs</Link>
        </div>

        {/* Trade Tools */}
        <div className="flex flex-col gap-3">
          <h4 className="text-white text-sm font-semibold uppercase tracking-widest mb-1">Trade Tools</h4>
          <Link href="/register" className="text-gray-400 hover:text-white transition-colors text-sm">Copy Trading</Link>
          <Link href="/register" className="text-gray-400 hover:text-white transition-colors text-sm">PAMM Accounts</Link>
          <Link href="/register" className="text-gray-400 hover:text-white transition-colors text-sm">Vivid AI</Link>
          <Link href="/register" className="text-gray-400 hover:text-white transition-colors text-sm">Trading Signals</Link>
          <Link href="/register" className="text-gray-400 hover:text-white transition-colors text-sm">Economic Calendar</Link>
        </div>

        {/* Company */}
        <div className="flex flex-col gap-3">
          <h4 className="text-white text-sm font-semibold uppercase tracking-widest mb-1">Company</h4>
          <Link href="/about" className="text-gray-400 hover:text-white transition-colors text-sm">About Us</Link>
          <a href="mailto:support@worldstreetgold.com" className="text-gray-400 hover:text-white transition-colors text-sm">Contact</a>
          <Link href="/academy" className="text-gray-400 hover:text-white transition-colors text-sm">WS Academy</Link>
          <Link href="/blog" className="text-gray-400 hover:text-white transition-colors text-sm">Blog</Link>
          <a href="mailto:support@worldstreetgold.com" className="text-gray-400 hover:text-white transition-colors text-sm">Support</a>
        </div>
      </div>

      {/* Newsletter */}
      <div className="border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="text-white font-semibold text-sm mb-1">Subscribe Newsletter</p>
            <p className="text-gray-400 text-sm">Stay updated with market insights, trading tips, and exclusive offers.</p>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full md:w-auto gap-2"
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 md:w-64 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 outline-none focus:border-[#FFCC2D] transition-colors"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-full bg-[#FFCC2D] text-black text-sm font-semibold hover:bg-white transition-colors shrink-0"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Regulatory & Risk */}
      <div className="border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-4">
          <p className="text-[11px] text-gray-500 leading-relaxed">
            <span className="text-gray-400 font-medium">Regulatory Information:</span> Worldstreet entities are regulated by the appropriate financial authorities in each jurisdiction. Worldstreet Markets Limited is authorised to carry out the following Regulated Activities: (i) Dealing in Investments as Principal; (ii) Dealing in Investments as Agent; (iii) Arranging Deals in Investments; (iv) Managing Assets; (v) Providing Money Services; and (vi) Arranging Custody. All trading services are provided through properly licensed entities.
          </p>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            <span className="text-gray-400 font-medium">Risk Warning:</span> Trading foreign exchange, cryptocurrencies, and CFDs carries a high level of risk and may not be suitable for all investors. The value of your investment may go down or up and you may not get back the amount invested. You are solely responsible for your investment decisions and Worldstreet is not liable for any trading losses you may incur. Before deciding to trade, you should carefully consider your investment objectives, level of experience, and risk appetite. You should not invest money that you cannot afford to lose.
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-gray-500">
          <span>Copyright &copy; 2026 Worldstreet. All rights reserved.</span>
          <div className="flex gap-5">
            <Link href="/legal" className="hover:text-white transition-colors">Legal</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>

    </footer>
  );
}
