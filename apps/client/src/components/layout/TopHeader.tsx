import { User, Languages } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { type ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useProjects } from "../../features/projects/projects.queries";
import { useProjectStore } from "../../features/projects/project.store";
import { findProject, getProjectSwitchPath, getRouteProjectId } from "../../features/projects/project.routes";
import { ProjectSwitcher } from "./ProjectSwitcher";
import { ThemeToggle } from "./ThemeToggle";

// This would typically come from shadcn/ui but we'll mock it if it's not ready
// and the user will run shadcn add later.
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function TopHeader({ className, ...props }: ComponentProps<"header">) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { data } = useProjects();
  const lastProjectId = useProjectStore((state) => state.lastProjectId);
  const setLastProject = useProjectStore((state) => state.setLastProject);
  const projects = data?.content ?? [];
  const routeProjectId = getRouteProjectId(location.pathname);
  const currentProject = findProject(projects, routeProjectId ?? lastProjectId);

  const handleProjectSelect = (project: { id: string }) => {
    setLastProject(project.id);
    navigate(getProjectSwitchPath(location.pathname, project.id));
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-md px-4 md:hidden",
        className
      )}
      {...props}
    >
      <div className="min-w-0 flex-1 overflow-x-auto scrollbar-hide pl-10">
        <ProjectSwitcher
          compact
          projects={projects}
          currentProject={currentProject}
          onProjectSelect={handleProjectSelect}
        />
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Languages className="h-5 w-5" />
              <span className="sr-only">{t("common:navigation.toggleLanguage", "Toggle language")}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => i18n.changeLanguage("en")}>English</DropdownMenuItem>
            <DropdownMenuItem onClick={() => i18n.changeLanguage("vi")}>Tiếng Việt</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
              <span className="sr-only">{t("common:navigation.toggleUserMenu", "Toggle user menu")}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t("common:navigation.myAccount", "My Account")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>{t("common:navigation.profile", "Profile")}</DropdownMenuItem>
            <DropdownMenuItem>{t("common:navigation.settings", "Settings")}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">{t("common:navigation.logout", "Logout")}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
