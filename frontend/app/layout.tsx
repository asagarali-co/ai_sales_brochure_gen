import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Sales Brochure Generator",
  applicationName: "AI Sales Brochure Generator",
  description: "Create sales brochure drafts from company websites with AI. Summarize public pages and get clear answers in one content workspace.",
  icons: {
    icon: [{ url: "/logo.svg", type: "image/svg+xml", sizes: "any" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "AI Sales Brochure Generator",
    description: "Turn company websites into sales brochure drafts with AI.",
    siteName: "AI Sales Brochure Generator",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "AI Sales Brochure Generator",
    description: "Turn company websites into sales brochure drafts with AI.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
