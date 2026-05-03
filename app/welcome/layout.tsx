import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Welcome | Worldstreet",
  description: "Your unified Worldstreet hub — pick a platform to dive into.",
};

export default function WelcomeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
