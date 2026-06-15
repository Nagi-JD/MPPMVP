import "./globals.css";
import type { Metadata, Viewport } from "next";
import { BottomNav } from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "MPP+ — The Social Predictor",
  description: "Predict football, esports & sports. Earn points. Climb leaderboards.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "MPP+", statusBarStyle: "black-translucent" },
  // Browser + Apple icons are auto-detected from src/app/icon.png and
  // src/app/apple-icon.png (Next App Router file convention).
};
export const viewport: Viewport = {
  themeColor: "#5A0FC8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

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
