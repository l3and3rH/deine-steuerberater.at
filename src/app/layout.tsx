import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const BASE_URL = "https://steuerberater-verzeichnis.at";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Steuerberater Verzeichnis Österreich",
    template: "%s | Steuerberater Österreich",
  },
  description:
    "Das führende Steuerberater-Verzeichnis für Österreich. Finden Sie den passenden Steuerberater in Ihrer Stadt.",
  openGraph: {
    type: "website",
    locale: "de_AT",
    siteName: "Steuerberater.at",
    title: "Steuerberater Verzeichnis Österreich",
    description: "Das führende Steuerberater-Verzeichnis für Österreich. Finden Sie den passenden Steuerberater in Ihrer Stadt.",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Steuerberater Verzeichnis Österreich" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Steuerberater Verzeichnis Österreich",
    description: "Das führende Steuerberater-Verzeichnis für Österreich.",
    images: ["/og-default.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  other: {
    "theme-color": "#0f2b1d",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${fraunces.variable} ${outfit.variable}`}>
      {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
        <head>
          <script
            defer
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
          />
        </head>
      )}
      <body className="font-body">
        <Providers>
          <div className="grain-overlay" aria-hidden="true" />
          <Navbar />
          {children}
          <Footer />
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
