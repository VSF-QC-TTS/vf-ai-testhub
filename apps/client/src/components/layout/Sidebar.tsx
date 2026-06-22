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

export function Sidebar({ className, ...props }: ComponentProps<"aside">) {
  const { t } = useTranslation();
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
      <div className="flex h-14 lg:h-16 items-center border-b px-4 lg:px-6">
        <Link to="/" className="flex items-center">
          <BrandLogo hideTextOnMobile textClassName="text-sm" />
        </Link>
      </div>
      
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
    </aside>
  );
}
