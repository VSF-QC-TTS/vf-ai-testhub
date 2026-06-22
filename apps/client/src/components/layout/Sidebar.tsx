import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { type ComponentProps } from "react";

import { ProjectSwitcher } from "./ProjectSwitcher";
import { useTranslation } from "react-i18next";
import { navItems } from "./config";
import { useProjects } from "../../features/projects/projects.queries";
import { useProjectStore } from "../../features/projects/project.store";
import { findProject, getProjectNavPath, getProjectSwitchPath, getRouteProjectId } from "../../features/projects/project.routes";
import { BrandLogo } from "../ui/Logo";

import { ThemeToggle } from "./ThemeToggle";
import { User, Languages } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function Sidebar({ className, ...props }: ComponentProps<"aside">) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { data } = useProjects();
  const lastProjectId = useProjectStore((state) => state.lastProjectId);
  const setLastProject = useProjectStore((state) => state.setLastProject);
  
  const projects = data?.content ?? [];
  const routeProjectId = getRouteProjectId(location.pathname);
  const currentProjectId = routeProjectId ?? lastProjectId;
  const currentProject = findProject(projects, currentProjectId);

  const handleProjectSelect = (project: { id: string }) => {
    setLastProject(project.id);
    navigate(getProjectSwitchPath(location.pathname, project.id));
  };

  return (
    <aside 
      className={cn(
        "fixed inset-y-0 left-0 z-10 hidden flex-col border-r bg-surface md:flex md:w-16 lg:w-64 transition-all duration-300", 
        className
      )} 
      {...props}
    >
      <div className="flex h-14 lg:h-16 items-center px-4 lg:px-6">
        <Link to="/" className="flex items-center">
          <BrandLogo hideTextOnMobile textClassName="text-sm" />
        </Link>
      </div>

      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-2">
        <ProjectSwitcher
          projects={projects}
          currentProject={currentProject}
          onProjectSelect={handleProjectSelect}
          className="hidden lg:block"
        />
        <ProjectSwitcher
          projects={projects}
          currentProject={currentProject}
          onProjectSelect={handleProjectSelect}
          className="md:block lg:hidden"
          isCollapsed
        />
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        <ul className="grid gap-1 px-2 lg:px-4">
          {navItems.map((item) => {
            const to = getProjectNavPath(routeProjectId, item.module);
            const isActive = to
              ? item.module
                ? location.pathname === to || location.pathname.startsWith(`${to}/`)
                : location.pathname === to
              : false;
            const label = t(item.i18nKey);

            return (
              <li key={item.module ?? "overview"}>
                {to ? (
                  <Link
                    to={to}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-elevated hover:text-foreground",
                      "md:justify-center lg:justify-start"
                    )}
                    title={label}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className="hidden lg:inline-block truncate">{label}</span>
                  </Link>
                ) : (
                <button
                  type="button"
                  disabled
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    "w-full cursor-not-allowed text-muted-foreground opacity-50",
                    "md:justify-center lg:justify-start"
                  )}
                  title={label}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span className="hidden lg:inline-block truncate">{label}</span>
                </button>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex md:flex-col lg:flex-row items-center justify-between gap-2 border-t border-zinc-200 dark:border-zinc-800 p-3 lg:p-4 bg-zinc-50/50 dark:bg-zinc-900/50 mt-auto">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full flex shrink-0 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
              <Languages className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
              <span className="sr-only">{t("common:navigation.toggleLanguage", "Toggle language")}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="right" sideOffset={12}>
            <DropdownMenuItem onClick={() => i18n.changeLanguage("en")}>English</DropdownMenuItem>
            <DropdownMenuItem onClick={() => i18n.changeLanguage("vi")}>Tiếng Việt</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full flex shrink-0 bg-primary/10 hover:bg-primary/20 text-primary transition-colors">
              <User className="h-4 w-4" />
              <span className="sr-only">{t("common:navigation.toggleUserMenu", "Toggle user menu")}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="right" sideOffset={12}>
            <DropdownMenuLabel>{t("common:navigation.myAccount", "My Account")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>{t("common:navigation.profile", "Profile")}</DropdownMenuItem>
            <DropdownMenuItem>{t("common:navigation.settings", "Settings")}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">{t("common:navigation.logout", "Logout")}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
