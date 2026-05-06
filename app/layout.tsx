import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import SmoothScrollProvider from "../providers/SmoothScrollProvider";
import { ProfileProvider } from "@/components/profile-provider";
import { AuthProvider } from "@/components/auth-provider";
import { IncomingCallProvider } from "@/components/community";
import { VividVoiceProvider } from "@/components/vivid-provider";

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
      signInUrl="/login"
      signUpUrl="/register"
      signInFallbackRedirectUrl="/welcome"
      signUpFallbackRedirectUrl="/welcome"
    >
      <html lang="en" className="dark">
        <body className={`${inter.variable} font-body antialiased bg-[#050505] text-white min-h-screen flex flex-col`}>
          <ProfileProvider>
            <AuthProvider>
              <IncomingCallProvider>
                <VividVoiceProvider>
                  <SmoothScrollProvider>
                    {children}
                  </SmoothScrollProvider>
                </VividVoiceProvider>
              </IncomingCallProvider>
            </AuthProvider>
          </ProfileProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
