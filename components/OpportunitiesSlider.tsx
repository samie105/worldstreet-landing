"use client";

import dynamic from "next/dynamic";

const MobileSlider = dynamic(
  () => import("./opportunities-slider/MobileSlider"),
  { ssr: false },
);
const DesktopSlider = dynamic(
  () => import("./opportunities-slider/DesktopSlider"),
  { ssr: false },
);

export default function OpportunitiesSlider() {
  const isMobile =
    typeof window !== "undefined" && window.innerWidth < 768;

  return isMobile ? <MobileSlider /> : <DesktopSlider />;
}

