export default function Footer() {
  return (
    <footer className="w-full bg-[#050505] border-t border-[rgba(255,255,255,0.05)] text-gray-400 py-16 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12 md:gap-24">
        {/* Left column */}
        <div className="flex flex-col max-w-sm shrink-0">
          <a href="/" className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 flex items-center justify-center">
              <img src="/worldstreet-logo/WorldStreet4.png" alt="Worldstreet Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold tracking-tight"><span className="text-white">World</span><span className="text-[#FFCC2D]">Street</span><span className="text-white">.</span></span>
          </a>
          <p className="text-sm md:text-base leading-relaxed text-gray-400 mb-10">
            Secure, fast, and seamless crypto trading.<br />
            Worldstreet makes digital assets effortless.
          </p>
        </div>

        {/* Right Columns */}
        <div className="flex flex-col sm:flex-row gap-16 sm:gap-24 grow md:justify-end w-full">
          {/* Output structure for links, similar to screenshot */}
          <div className="flex flex-col gap-5">
            <h4 className="text-white font-medium mb-1">Navigation</h4>
            <a href="/#features" className="text-gray-400 hover:text-white transition-colors">Why Worldstreet?</a>
            <a href="/leaderboard" className="text-gray-400 hover:text-white transition-colors">Cryptos</a>
            <a href="/#features" className="text-gray-400 hover:text-white transition-colors">How it works</a>
            <a href="/#faq" className="text-gray-400 hover:text-white transition-colors">FAQ</a>
            <a href="/register" className="text-gray-400 hover:text-white transition-colors">Get Started</a>
          </div>

          <div className="flex flex-col gap-5">
            <h4 className="text-white font-medium mb-1">Socials</h4>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter (X)</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Instagram</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
