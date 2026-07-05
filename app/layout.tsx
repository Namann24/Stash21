import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundFX from "@/components/BackgroundFX";
import AmbientGlow from "@/components/AmbientGlow";
import CustomCursor from "@/components/CustomCursor";
import ScrollProgress from "@/components/ScrollProgress";
import PageTransition from "@/components/PageTransition";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://stash21.com"),
  title: "Stash21 | IoT & Hardware Projects, Tutorials, Blogs",
  description:
    "Stash21 is a hub for IoT tinkerers and hardware hackers — deep-dive tutorials, project write-ups, and community-driven ideas.",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "Stash21 | IoT & Hardware Projects",
    description:
      "Deep-dive IoT tutorials, hardware builds, and community-driven project ideas.",
    siteName: "Stash21",
    type: "website"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-ink text-brass-light font-body antialiased selection:bg-copper selection:text-ink relative">
        <div className="noise-overlay" />
        <BackgroundFX />
        <AmbientGlow />
        <CustomCursor />
        <ScrollProgress />
        <Navbar />
        <main className="min-h-screen relative z-10">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
      </body>
    </html>
  );
}
