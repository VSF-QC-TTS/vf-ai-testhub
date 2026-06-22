import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { t } = useTranslation();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme from localStorage or system preference
    const storedTheme = localStorage.getItem("vf_theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (storedTheme === "dark" || (!storedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("vf_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("vf_theme", "light");
    }
  };

  return (
    <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full flex shrink-0 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors" onClick={toggleTheme} title={t("common:navigation.toggleTheme", "Toggle theme")}>
      {isDark ? <Moon className="h-4 w-4 text-zinc-600 dark:text-zinc-400 shrink-0" /> : <Sun className="h-4 w-4 text-zinc-600 dark:text-zinc-400 shrink-0" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
