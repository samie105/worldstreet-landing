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
            <span className="text-xl font-bold tracking-tight text-white">Worldstreet.</span>
          </a>
          <p className="text-sm md:text-base leading-relaxed text-gray-400 mb-10">
            Secure, fast, and seamless crypto trading.<br />
            Worldstreet makes digital assets effortless.
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-auto">
            <span>Created by</span>
            {/* Using a placeholder avatar for the 'Arthur' mentioned in screenshot */}
            <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-300">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <span className="text-white font-medium">Arthur</span>
            <span>in</span>
            <span className="text-white font-medium">Framer</span>
          </div>
        </div>

        {/* Right Columns */}
        <div className="flex flex-col sm:flex-row gap-16 sm:gap-24 grow md:justify-end w-full">
          {/* Output structure for links, similar to screenshot */}
          <div className="flex flex-col gap-5">
            <h4 className="text-white font-medium mb-1">Navigation</h4>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Why Worldstreet?</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Cryptos</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">How it works</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">404</a>
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
