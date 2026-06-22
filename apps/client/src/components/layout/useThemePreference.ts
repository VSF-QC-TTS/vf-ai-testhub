import { useEffect, useState } from "react";

function getInitialIsDark(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const storedTheme = localStorage.getItem("vf_theme");
  const prefersDark =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  return storedTheme === "dark" || (!storedTheme && prefersDark);
}

export function useThemePreference() {
  const [isDark, setIsDark] = useState(getInitialIsDark);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    localStorage.setItem("vf_theme", newIsDark ? "dark" : "light");
  };

  return { isDark, toggleTheme };
}
