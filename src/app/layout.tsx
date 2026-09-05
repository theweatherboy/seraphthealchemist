import type { Metadata } from "next";
import { Cinzel, Inter } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Seraph, The Alchemist | Seraph the Alchemist",
  description: "An immersive digital temple for exploring consciousness, spirituality, mysticism, and the transformation of the self.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-obsidian text-moon-ivory">
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
