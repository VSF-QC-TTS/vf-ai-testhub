import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  hideTextOnMobile?: boolean;
}

export function BrandLogo({ className, iconClassName, textClassName, hideTextOnMobile }: BrandLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn("h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0", iconClassName)}>
        <Bot className="h-5 w-5 text-foreground" />
      </div>
      <span className={cn("font-semibold tracking-tight", hideTextOnMobile ? "hidden md:inline-block" : "", textClassName)}>
        VinFast AI TestHub
      </span>
    </div>
  );
}
