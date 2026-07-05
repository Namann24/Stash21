"use client";
import { usePathname } from "next/navigation";

export default function BackgroundFX() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <>
      {isHome && (
        <div className="fixed inset-0 -z-20 mesh-gradient mesh-gradient-animated opacity-70 pointer-events-none" />
      )}
      <div className="fixed -z-10 top-[-15%] left-[-10%] w-[42vw] h-[42vw] max-w-[560px] max-h-[560px] rounded-full bg-copper/8 blur-[110px] pointer-events-none" />
      <div className="fixed -z-10 bottom-[-15%] right-[-10%] w-[46vw] h-[46vw] max-w-[620px] max-h-[620px] rounded-full bg-maroon/12 blur-[130px] pointer-events-none" />
      {isHome && (
        <div className="fixed -z-10 top-[35%] right-[8%] w-[30vw] h-[30vw] max-w-[420px] max-h-[420px] rounded-full bg-violet/10 blur-[130px] pointer-events-none" />
      )}
    </>
  );
}
