"use client";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";

export default function BackgroundFX() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const isHome = pathname === "/";
  const isLight = theme === "light";

  return (
    <>
      {isHome && (
        <div className="fixed inset-0 -z-20 mesh-gradient opacity-70 pointer-events-none" />
      )}
      <div
        className="fixed -z-10 top-[-15%] left-[-10%] w-[42vw] h-[42vw] max-w-[560px] max-h-[560px] rounded-full blur-[110px] pointer-events-none transition-colors duration-700"
        style={{
          backgroundColor: isLight ? "rgba(201,162,75,0.08)" : "rgba(184,115,51,0.08)",
        }}
      />
      <div
        className="fixed -z-10 bottom-[-15%] right-[-10%] w-[46vw] h-[46vw] max-w-[620px] max-h-[620px] rounded-full blur-[130px] pointer-events-none transition-colors duration-700"
        style={{
          backgroundColor: isLight ? "rgba(139,90,30,0.07)" : "rgba(90,18,32,0.12)",
        }}
      />
      {isHome && (
        <div
          className="fixed -z-10 top-[35%] right-[8%] w-[30vw] h-[30vw] max-w-[420px] max-h-[420px] rounded-full blur-[130px] pointer-events-none transition-colors duration-700"
          style={{
            backgroundColor: isLight ? "rgba(184,115,51,0.06)" : "rgba(139,111,232,0.10)",
          }}
        />
      )}
    </>
  );
}
