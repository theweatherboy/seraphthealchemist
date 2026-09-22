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
    images: [{ url: "/seraph-earthly-logo-v1.png", width: 1254, height: 1254, alt: "Seraph, The Alchemist golden emblem" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Seraph, The Alchemist",
    description: "Sacred knowledge and healing for the seeker. A thread back to yourself.",
    images: ["/seraph-earthly-logo-v1.png"],
  },
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
