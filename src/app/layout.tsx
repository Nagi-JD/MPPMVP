import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Archivo, Inter, JetBrains_Mono } from "next/font/google";
import { BottomNav } from "@/components/BottomNav";

const display = Archivo({ subsets: ["latin"], variable: "--font-display", weight: ["600", "700", "800"] });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["500", "700"] });

export const metadata: Metadata = {
  title: "MPP+ — The Social Predictor",
  description: "Call the result. Stack your streak. Football, esports & sports.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "MPP+", statusBarStyle: "black-translucent" },
  // Browser + Apple icons auto-detected from src/app/icon.png and apple-icon.png.
};
export const viewport: Viewport = {
  themeColor: "#0B0916",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <div className="app-frame">
          <main className="min-h-screen pb-24">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
