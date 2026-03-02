import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Steuerberater Verzeichnis Österreich",
    template: "%s | Steuerberater Österreich",
  },
  description:
    "Das führende Steuerberater-Verzeichnis für Österreich. Finden Sie den passenden Steuerberater in Ihrer Stadt.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
