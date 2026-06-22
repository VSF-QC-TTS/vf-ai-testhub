import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useThemePreference } from "./useThemePreference";

interface ThemeToggleProps {
  className?: string;
  iconClassName?: string;
}

export function ThemeToggle({ className, iconClassName }: ThemeToggleProps) {
  const { t } = useTranslation();
  const { isDark, toggleTheme } = useThemePreference();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("w-10 h-10 rounded-full flex shrink-0 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors", className)}
      onClick={toggleTheme}
      title={t("common:navigation.toggleTheme", "Toggle theme")}
    >
      {isDark ? (
        <Moon className={cn("h-4 w-4 text-zinc-600 dark:text-zinc-400 shrink-0", iconClassName)} />
      ) : (
        <Sun className={cn("h-4 w-4 text-zinc-600 dark:text-zinc-400 shrink-0", iconClassName)} />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
