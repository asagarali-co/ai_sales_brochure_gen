import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Free AI Sales Brochure Generator",
  applicationName: "AI Sales Brochure Generator",
  description: "Create free AI sales brochure drafts from company websites. Summarize public pages and get clear answers in one content workspace.",
  keywords: [
    "free AI sales brochure generator",
    "AI brochure generator",
    "sales brochure generator",
    "free brochure maker",
    "company brochure AI",
  ],
  icons: {
    icon: [{ url: "/logo.svg", type: "image/svg+xml", sizes: "any" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "Free AI Sales Brochure Generator",
    description: "Turn company websites into free sales brochure drafts with AI.",
    siteName: "AI Sales Brochure Generator",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Free AI Sales Brochure Generator",
    description: "Turn company websites into free sales brochure drafts with AI.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9847799502456875"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
