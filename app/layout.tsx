import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NavBarWrapper } from "../components/NavBarWrapper";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VampCatCoin Verification",
  description: "Trusted Web3 professionals.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} min-h-screen flex flex-col bg-vampBg text-vampTextMain`}
      >
        {/* STATIC BACKGROUND GRID */}
        <div className="bg-geo-grid" />

        {/* MAIN APP CHROME */}
        <NavBarWrapper />
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 pt-8 pb-14">
          {children}
        </main>
        <footer className="w-full border-t border-vampBorder bg-black/60 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 py-4 text-xs text-vampTextMuted flex justify-between">
            <span>
              © {new Date().getFullYear()} VampCatCoin · VampCatCoin Verification
            </span>
            <span className="text-[10px]">
              Not financial or hiring advice
            </span>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}

