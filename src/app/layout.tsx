import "./globals.css";
import type { Metadata, Viewport } from "next";
import { BottomNav } from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "MPP+ — The Social Predictor",
  description: "Predict football, esports & sports. Earn points. Climb leaderboards.",
  manifest: "/manifest.webmanifest",
};
export const viewport: Viewport = { themeColor: "#5A0FC8" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="mx-auto max-w-md min-h-screen pb-16">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
