import "./globals.css";
import type { Metadata } from "next";
import BackgroundFX from "@/components/BackgroundFX";
import AmbientGlow from "@/components/AmbientGlow";
import ThemeProvider from "@/components/ThemeProvider";
import FloatingGears from "@/components/FloatingGears";
import BootSequence from "@/components/BootSequence";
import CircuitTraces from "@/components/CircuitTraces";
import RadarSweep from "@/components/RadarSweep";

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
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        {/* Prevent flash of unstyled theme — runs before paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('stash21_theme');
                  if (saved === 'light' || saved === 'dark') {
                    document.documentElement.setAttribute('data-theme', saved);
                  } else {
                    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased relative" style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}>
        <ThemeProvider>
          <div className="crt-overlay" />
          <RadarSweep />
          <BootSequence />
          <div className="noise-overlay" />
          <BackgroundFX />
          <AmbientGlow />
          <CircuitTraces />
          <FloatingGears />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
