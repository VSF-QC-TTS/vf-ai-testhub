import { ChevronsUpDown, Folder, Settings2 } from "lucide-react";
import { Link } from "react-router-dom";
import { type ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export interface Project {
  id: string;
  name: string;
}

interface ProjectSwitcherProps extends ComponentProps<"div"> {
  projects?: Project[];
  currentProject?: Project;
  onProjectSelect?: (project: Project) => void;
  isCollapsed?: boolean;
  compact?: boolean;
  tone?: "default" | "sidebar";
}

export function ProjectSwitcher({
  projects = [],
  currentProject,
  onProjectSelect,
  isCollapsed,
  compact,
  tone = "default",
  className,
  ...props
}: ProjectSwitcherProps) {
  const { t } = useTranslation();
  const isSidebarTone = tone === "sidebar";

  return (
    <div className={cn(compact ? "min-w-0" : "px-2 lg:px-4 mb-2 mt-2", className)} {...props}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-12 w-full justify-start overflow-hidden py-2",
              isCollapsed ? "px-2 justify-center" : "px-3",
              isSidebarTone &&
                "border-border bg-muted/50 text-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-100 dark:hover:bg-white/[0.10] dark:hover:text-white dark:focus-visible:ring-white/30 dark:focus-visible:ring-offset-[#15181d]"
            )}
            aria-label={t("projects:switcher.select")}
            title={currentProject?.name ?? t("projects:switcher.select")}
          >
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                isSidebarTone ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                !isCollapsed && "mr-2"
              )}
            >
              <Folder className="h-4 w-4" />
            </span>
            {!isCollapsed && (
              <>
                <span className="min-w-0 flex-1 text-left">
                  <span
                    className={cn(
                      "block truncate text-[11px] font-medium uppercase",
                      isSidebarTone ? "text-muted-foreground dark:text-zinc-400" : "text-muted-foreground"
                    )}
                  >
                    {t("projects:switcher.current")}
                  </span>
                  <span className="block truncate">{currentProject?.name || t("projects:switcher.select")}</span>
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[200px]">
          <DropdownMenuLabel>{t("projects:switcher.title")}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {projects.length === 0 ? (
            <DropdownMenuItem asChild className="cursor-pointer text-muted-foreground">
              <Link to="/projects/new" className="w-full flex items-center">
                <Settings2 className="mr-2 h-4 w-4" />
                {t("projects:switcher.create")}
              </Link>
            </DropdownMenuItem>
          ) : (
            projects.map((project) => (
              <DropdownMenuItem
                key={project.id}
                onClick={() => onProjectSelect?.(project)}
                className="cursor-pointer"
              >
                {project.name}
              </DropdownMenuItem>
            ))
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="cursor-pointer text-muted-foreground mt-2">
            <Link to="/projects" className="w-full flex items-center">
              <Settings2 className="mr-2 h-4 w-4" />
              {t("projects:switcher.manage")}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
