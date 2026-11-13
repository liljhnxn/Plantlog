import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "PlantLog | Grow Something. Track Every Step.",
  description: "A decentralized, on-chain plant care and growth log powered by Botchain Mainnet.",
  keywords: ["PlantLog", "Web3", "Solidity", "Plant Tracker", "Botanical Care", "Botchain", "BOT Chain"],
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-nature-200 selection:text-nature-900 bg-[#fbf8f5]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

