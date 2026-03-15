"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    // Lenis overrides native scroll so hash anchors (#features, #faq, etc.)
    // must be forwarded manually via lenis.scrollTo()
    const scrollToHash = (hash: string) => {
      if (!hash) return;
      const el = document.querySelector(hash);
      if (el) lenis.scrollTo(el as HTMLElement, { offset: -80, duration: 1.2 });
    };

    // Scroll to hash on initial page load
    if (window.location.hash) scrollToHash(window.location.hash);

    // Handle hash changes triggered by link clicks
    const onHashChange = () => scrollToHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  return <>{children}</>;
}
