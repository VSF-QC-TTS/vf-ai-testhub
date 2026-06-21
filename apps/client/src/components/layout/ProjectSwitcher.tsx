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
}

export function ProjectSwitcher({
  projects = [],
  currentProject,
  onProjectSelect,
  isCollapsed,
  className,
  ...props
}: ProjectSwitcherProps) {
  const { t } = useTranslation();

  return (
    <div className={cn("px-2 lg:px-4 mb-2 mt-2", className)} {...props}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start",
              isCollapsed ? "px-2 justify-center" : "px-3"
            )}
            aria-label={t("projects:switcher.select")}
          >
            <Folder className={cn("h-4 w-4 shrink-0", !isCollapsed && "mr-2")} />
            {!isCollapsed && (
              <>
                <span className="truncate flex-1 text-left">
                  {currentProject?.name || t("projects:switcher.select")}
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
              <Link to="/projects?action=new" className="w-full flex items-center">
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
