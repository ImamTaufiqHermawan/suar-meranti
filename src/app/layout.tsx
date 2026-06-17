import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://suar-meranti.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "SuarMeranti — Kotak Saran & Aspirasi Warga Bukit Meranti",
  description:
    "Platform aspirasi warga Cluster Bukit Meranti, Citra Indah City Jonggol. Sampaikan saran, aspirasi, keluhan, dan pujian Anda. Suara Warga, Harmoni Komunitas.",
  keywords: [
    "Bukit Meranti",
    "Citra Indah City",
    "Jonggol",
    "kotak saran",
    "aspirasi warga",
    "SuarMeranti",
  ],
  authors: [{ name: "SuarMeranti" }],
  openGraph: {
    title: "SuarMeranti — Kotak Saran & Aspirasi Warga",
    description:
      "Suara Warga, Harmoni Komunitas. Cluster Bukit Meranti, Citra Indah City Jonggol.",
    url: appUrl,
    siteName: "SuarMeranti",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SuarMeranti — Kotak Saran & Aspirasi Warga",
    description: "Suara Warga, Harmoni Komunitas — Bukit Meranti",
  },
  robots: { index: true, follow: true },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#1b4332",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${plusJakarta.variable} h-full`}
    >
      <body className="flex min-h-full flex-col antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
