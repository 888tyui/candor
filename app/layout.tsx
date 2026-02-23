import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
  weight: ["700", "800"],
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://candor.sh";

export const metadata: Metadata = {
  title: {
    default: "Candor — Real-time Observability for AI Agents",
    template: "%s — Candor",
  },
  description:
    "A transparent proxy that intercepts, logs, and visualizes every action AI agents take through MCP servers. Sentry for AI agents.",
  metadataBase: new URL(siteUrl),
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Candor",
    title: "Candor — Real-time Observability for AI Agents",
    description:
      "A transparent proxy that intercepts, logs, and visualizes every action AI agents take through MCP servers.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Candor — Observability for AI Agents",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Candor — Real-time Observability for AI Agents",
    description:
      "A transparent proxy that intercepts, logs, and visualizes every action AI agents take through MCP servers.",
    images: ["/og-image.png"],
    creator: "@candor_io",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${bricolage.variable} ${figtree.variable} ${ibmPlexMono.variable} antialiased`}
      >
        {children}
        <div className="grain-overlay" aria-hidden="true" />
      </body>
    </html>
  );
}
