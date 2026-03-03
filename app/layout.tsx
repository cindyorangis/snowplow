import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import Navbar from "@/components/layout/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SnowPro Services | Toronto Snow Removal & De-Icing",
  description: "Professional residential & commercial snow removal in Toronto & the GTA. Seasonal contracts, salting, and de-icing. Get your free quote today.",
  keywords: "snow removal, snow plowing, snow shoveling, snow blowing, salting, de-icing, Toronto, GTA, residential snow removal, commercial snow removal, seasonal contracts",
  openGraph: {
    title: "SnowPro Services | Toronto Snow Removal & De-Icing",
    description: "Professional residential & commercial snow removal in Toronto & the GTA. Seasonal contracts, salting, and de-icing. Get your free quote today.",
    siteName: "SnowPro Services",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
