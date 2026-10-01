import type { Metadata } from "next";
import { Cinzel, Inter, Nunito_Sans } from "next/font/google";
import "./globals.css";
import "@/components/layout/sanctuary-interiors.css";
import "@/components/layout/ethereal-glass.css";
import AppShell from "@/components/layout/AppShell";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const glassFont = Nunito_Sans({
  variable: "--font-glass",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.seraphthealchemist.com"),
  title: "Seraph, The Alchemist | Seraph the Alchemist",
  description: "An immersive digital temple for exploring consciousness, spirituality, mysticism, and the transformation of the self.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Seraph, The Alchemist",
    title: "Seraph, The Alchemist",
    description: "Sacred knowledge and healing for the seeker. A thread back to yourself.",
    images: [{ url: "/seraph-golden-share-v1.png", width: 1200, height: 1200, alt: "Seraph the Alchemist golden sigil with iridescent wings, a crescent moon, and radiant stars" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Seraph, The Alchemist",
    description: "Sacred knowledge and healing for the seeker. A thread back to yourself.",
    images: ["/seraph-golden-share-v1.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${inter.variable} ${glassFont.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-obsidian text-moon-ivory">
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
