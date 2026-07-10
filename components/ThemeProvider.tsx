"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from "react";

type Theme = "dark" | "light";

type ThemeContextType = {
  theme: Theme;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggle: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const saved = localStorage.getItem("stash21_theme") as Theme | null;
    if (saved) {
      setTheme(saved);
    } else {
      const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
      setTheme(prefersLight ? "light" : "dark");
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("stash21_theme", theme);
  }, [theme, mounted]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("stash21_theme")) {
        setTheme(e.matches ? "light" : "dark");
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const toggle = useCallback(() => {
    const html = document.documentElement;
    html.classList.add("theme-transitioning");
    clearTimeout(flashTimer.current);
    setTheme(prev => prev === "dark" ? "light" : "dark");
    flashTimer.current = setTimeout(() => {
      html.classList.remove("theme-transitioning");
    }, 380);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
