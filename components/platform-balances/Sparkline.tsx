"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface SparklineProps {
  data: number[];
  accent: string;
  height?: number;
  animateKey?: string | number; // change to re-trigger draw
}

export default function Sparkline({ data, accent, height = 80, animateKey }: SparklineProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const fillRef = useRef<SVGPathElement>(null);

  const width = 600;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);

  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 8) - 4;
    return [x, y] as const;
  });

  // smooth curve via cubic bezier
  const linePath = points.reduce((acc, [x, y], i) => {
    if (i === 0) return `M ${x} ${y}`;
    const [px, py] = points[i - 1];
    const cx = (px + x) / 2;
    return `${acc} Q ${cx} ${py} ${cx} ${(py + y) / 2} T ${x} ${y}`;
  }, "");

  const fillPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

  useEffect(() => {
    if (!pathRef.current || !fillRef.current) return;
    const length = pathRef.current.getTotalLength();
    gsap.set(pathRef.current, { strokeDasharray: length, strokeDashoffset: length });
    gsap.set(fillRef.current, { opacity: 0 });
    const tl = gsap.timeline();
    tl.to(pathRef.current, {
      strokeDashoffset: 0,
      duration: 0.85,
      ease: "power2.inOut",
    }).to(
      fillRef.current,
      { opacity: 1, duration: 0.5, ease: "power2.out" },
      "-=0.3",
    );
    return () => {
      tl.kill();
    };
  }, [animateKey]);

  const gradId = `spark-grad-${accent.replace("#", "")}-${animateKey ?? "x"}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="w-full"
      style={{ height }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.45" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path ref={fillRef} d={fillPath} fill={`url(#${gradId})`} />
      <path
        ref={pathRef}
        d={linePath}
        fill="none"
        stroke={accent}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
