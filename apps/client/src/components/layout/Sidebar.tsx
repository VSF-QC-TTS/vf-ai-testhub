import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { type ComponentProps } from "react";

import { ProjectSwitcher } from "./ProjectSwitcher";
import { useTranslation } from "react-i18next";
import { navItems } from "./config";
import { useProjects } from "../../features/projects/projects.queries";
import { useProjectStore } from "../../features/projects/project.store";
import { BrandLogo } from "../ui/Logo";

export function Sidebar({ className, ...props }: ComponentProps<"aside">) {
  const { t } = useTranslation();
  const location = useLocation();
  const { data } = useProjects();
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const setActiveProject = useProjectStore((s) => s.setActiveProject);
  
  const projects = data?.content || [];
  const currentProject = projects.find(p => p.id === activeProjectId);

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
        onProjectSelect={(p) => setActiveProject(p.id)}
        className="hidden lg:block"
      />
      <ProjectSwitcher 
        projects={projects} 
        currentProject={currentProject}
        onProjectSelect={(p) => setActiveProject(p.id)}
        className="md:block lg:hidden"
        isCollapsed
      />

      <nav className="flex-1 overflow-y-auto py-2">
        <ul className="grid gap-1 px-2 lg:px-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to));
            const isDisabled = item.projectScoped && !activeProjectId;
            
            return (
              <li key={item.to}>
                <Link
                  to={isDisabled ? "#" : item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive && !isDisabled
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:bg-elevated hover:text-foreground",
                    isDisabled && "opacity-50 pointer-events-none cursor-not-allowed",
                    "md:justify-center lg:justify-start"
                  )}
                  title={t(item.i18nKey as any)}
                  aria-disabled={isDisabled}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span className="hidden lg:inline-block truncate">{t(item.i18nKey as any)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
