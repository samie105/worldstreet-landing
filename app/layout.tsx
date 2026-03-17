import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import SmoothScrollProvider from "../providers/SmoothScrollProvider";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Worldstreet | Trade Forex and Crypto Markets With Confidence",
  description: "Join millions to securely trade crypto and fiat on a multi-sector digital ecosystem built to empower individuals and businesses worldwide.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      telemetry={false}
    >
      <html lang="en" className="dark">
        <body className={`${inter.variable} font-body antialiased bg-[#050505] text-white min-h-screen flex flex-col`}>
          <SmoothScrollProvider>
            {children}
          </SmoothScrollProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
