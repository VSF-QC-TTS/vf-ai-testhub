import { ChevronRight, User, Languages } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { type ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useProjects } from "../../features/projects/projects.queries";
import { useProjectStore } from "../../features/projects/project.store";
import { findProject, getProjectSwitchPath, getRouteProjectId } from "../../features/projects/project.routes";
import { ProjectSwitcher } from "./ProjectSwitcher";

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
  const paths = location.pathname.split("/").filter(Boolean);
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
        "sticky top-0 z-10 flex h-14 lg:h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-md pl-14 pr-4 md:px-4 lg:px-6",
        className
      )}
      {...props}
    >
      <div className="min-w-0 flex-1 overflow-x-auto scrollbar-hide">
        <ProjectSwitcher
          compact
          projects={projects}
          currentProject={currentProject}
          onProjectSelect={handleProjectSelect}
          className="w-[min(58vw,240px)] md:hidden"
        />
        <nav aria-label="Breadcrumb" className="hidden items-center text-sm text-muted-foreground whitespace-nowrap md:flex">
          {paths.map((path, index) => {
            const routeTo = `/${paths.slice(0, index + 1).join("/")}`;
            const isLast = index === paths.length - 1;

            let name = path;
            const translationKey = `nav.${path}`;
            const translated = t(translationKey);

            // Check if it's translated, else if it's the current project ID, else format it
            if (translated !== translationKey && translated !== path && translated !== `nav.${path}`) {
              name = translated;
            } else if (currentProject && path === currentProject.id) {
              name = currentProject.name;
            } else if (path.length > 20 && path.includes("-")) {
              // Likely a UUID for a target/dataset, truncate for readability
              name = `${path.substring(0, 8)}...`;
            } else {
              name = path.charAt(0).toUpperCase() + path.slice(1);
            }

            return (
              <div key={path} className="flex items-center">
                {index > 0 && <ChevronRight className="mx-1 h-4 w-4 shrink-0" />}
                {isLast ? (
                  <span className="font-medium text-foreground" aria-current="page">{name}</span>
                ) : (
                  <Link to={routeTo} className="hover:text-foreground transition-colors">{name}</Link>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Languages className="h-5 w-5" />
              <span className="sr-only">{t("common.navigation.toggleLanguage")}</span>
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
              <span className="sr-only">{t("common.navigation.toggleUserMenu")}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t("common.navigation.myAccount")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>{t("common.navigation.profile")}</DropdownMenuItem>
            <DropdownMenuItem>{t("common.navigation.settings")}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">{t("common.navigation.logout")}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
