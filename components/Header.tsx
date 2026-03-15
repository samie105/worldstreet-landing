"use client";

import { useState, useEffect, useRef } from "react";

type NavLink = {
  label: string;
  href?: string;
  dropdown?: { label: string; href: string }[];
};

const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Features", href: "/#features" },
  { 
    label: "Legal", 
    href: "/leaderboard",
    dropdown: [
      { label: "Privacy Policy", href: "/legal-docs/Privacy Policy.pdf" },
      { label: "Account Opening Agreement", href: "/legal-docs/WorldStreet Account Opening Agreement.pdf" },
      { label: "Risk Disclaimer", href: "/legal-docs/WorldStreet Risk Disclaimer.pdf" },
      { label: "Trading & Execution Risks", href: "/legal-docs/WorldStreet Trading & Execution Risks.pdf" },
      { label: "Anti-Money Laundering (AML)", href: "/legal-docs/WS Anti Money Laundering(2).pdf" },
      { label: "Cookie Policy", href: "/legal-docs/WS Cookie Policy 1.pdf" },
      { label: "Terms of Business", href: "/legal-docs/WS Terms of Business.pdf" },
      { label: "Order Execution Policy", href: "/legal-docs/WorldStreet Order Execution Policy 1.pdf" },
      { label: "Campaign Managers Program T&C", href: "/legal-docs/WS Campaign Managers Program Terms and Condition.pdf" },
    ]
  },
  { label: "Pricing", href: "/#pricing" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY;
      // Hide when scrolling down, show when scrolling up (or at top)
      setVisible(current < lastScrollY.current || current < 10);
      lastScrollY.current = current;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="bg-black/40 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 flex items-center justify-center">
              <img src="/worldstreet-logo/WorldStreet4.png" alt="Worldstreet Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold tracking-tight"><span className="text-white">World</span><span className="text-[#FFCC2D]">Street</span><span className="text-white">.</span></span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <div key={link.label} className="relative group">
                <a
                  href={link.href}
                  className="text-sm text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-1 py-4"
                >
                  {link.label}
                  {link.dropdown && (
                    <svg className="w-3 h-3 text-gray-400 group-hover:text-white transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </a>
                {link.dropdown && (
                  <div className="absolute top-[100%] left-0 hidden group-hover:block pt-2 w-80 z-50">
                    <div className="bg-[#050505] border border-white/10 rounded-xl shadow-2xl py-3 flex flex-col backdrop-blur-xl">
                      {link.dropdown.map((subLink) => (
                        <a
                          key={subLink.label}
                          href={subLink.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="px-6 py-3 text-[11px] text-gray-300 hover:text-white hover:bg-white/5 transition-colors uppercase tracking-widest font-bold font-sans"
                        >
                          {subLink.label}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center">
            <a
              href="#contact"
              className="px-5 py-2.5 rounded-full border border-white/20 text-sm font-medium text-white hover:bg-white/10 transition-all duration-200"
            >
              Get in Touch
            </a>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2"
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 bg-white transition-transform duration-200 ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-5 h-0.5 bg-white transition-opacity duration-200 ${mobileOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-white transition-transform duration-200 ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <nav className="md:hidden border-t border-white/[0.06] bg-black/60 backdrop-blur-xl px-6 py-4 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
            {navLinks.map((link) => (
              <div key={link.label} className="flex flex-col gap-2">
                <a
                  href={link.href}
                  onClick={() => !link.dropdown && setMobileOpen(false)}
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  {link.label}
                </a>
                {link.dropdown && (
                  <div className="pl-4 flex flex-col gap-3 py-2 border-l border-white/10 ml-2">
                    {link.dropdown.map((subLink) => (
                      <a
                        key={subLink.label}
                        href={subLink.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        onClick={() => setMobileOpen(false)}
                        className="text-xs text-gray-500 hover:text-white uppercase tracking-wider font-medium"
                      >
                        {subLink.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <a
              href="#contact"
              onClick={() => setMobileOpen(false)}
              className="mt-2 px-5 py-2.5 rounded-full border border-white/20 text-sm font-medium text-white text-center hover:bg-white/10 transition-all"
            >
              Get in Touch
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
