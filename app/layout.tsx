import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cardano Casino Integrity - SaaS Platform",
  description:
    "Verify game integrity, notarize logs, and generate tamper-proof on-chain receipts on Cardano",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
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
        className={`${_geist.className} antialiased bg-background text-foreground`}
      >
        <Providers>
          <div className="flex h-screen">
            <Sidebar />
            <div className="flex flex-col flex-1">
              <Navbar />
              <main className="flex-1 overflow-auto">{children}</main>
            </div>
          </div>
          <Toaster />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
