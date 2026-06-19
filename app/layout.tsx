import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

/* ===================================================
   FONT LOADING — Space Grotesk (display), IBM Plex Sans (body),
   IBM Plex Mono (utility/mono)
   =================================================== */
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ibm-plex-sans",
  weight: ["300", "400", "500", "600"],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ibm-plex-mono",
  weight: ["300", "400", "500"],
});

/* ===================================================
   SEO METADATA
   =================================================== */
export const metadata: Metadata = {
  title: "Dhruv Narayan Bajaj — Full-Stack Engineer, AI/ML Builder, Systems Programmer",
  description:
    "Portfolio of Dhruv Narayan Bajaj — building production-grade systems from kernel-level tools and real-time OpenGL engines to AI platforms serving real users in agriculture and fintech.",
  keywords: [
    "Dhruv Narayan Bajaj",
    "Full-Stack Engineer",
    "AI/ML",
    "Systems Programmer",
    "Next.js",
    "OpenGL",
    "TinyML",
    "Portfolio",
  ],
  authors: [{ name: "Dhruv Narayan Bajaj" }],
  openGraph: {
    title: "Dhruv Narayan Bajaj — Full-Stack Engineer",
    description:
      "I turn ideas into production-grade systems — from kernel-level tools and real-time OpenGL engines to AI platforms serving real users.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dhruv Narayan Bajaj — Full-Stack Engineer",
    description:
      "Building production-grade systems: AI platforms, OpenGL engines, TinyML research.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

import CustomCursor from "@/components/CustomCursor";
import NoiseOverlay from "@/components/NoiseOverlay";
import SmoothScroll from "@/components/SmoothScroll";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} antialiased`}
    >
      <body className="min-h-screen bg-bg text-ink relative">
        {/* CRT scanline overlay — very subtle, gives depth */}
        <div className="scanlines" aria-hidden="true" />
        <CustomCursor />
        <NoiseOverlay />
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
