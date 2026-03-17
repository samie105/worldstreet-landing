import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import SmoothScrollProvider from "../providers/SmoothScrollProvider";
import PasswordOverlay from "../components/PasswordOverlay";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Worldstreet | Trade Forex and Crypto Markets With Confidence",
  description: "Built to empower individuals, businesses and nations worldwide.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      telemetry={false}
      domain="worldstreetgold.com"
      isSatellite={false}
    >
      <html lang="en" className="dark">
        <body className={`${inter.variable} font-body antialiased bg-[#050505] text-white min-h-screen flex flex-col`}>
          <PasswordOverlay />
          <SmoothScrollProvider>
            {children}
          </SmoothScrollProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
