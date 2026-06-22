import { Menu } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { useTranslation } from "react-i18next";
import { navItems } from "./config";
import { ProjectSwitcher } from "./ProjectSwitcher";
import { useProjects } from "../../features/projects/projects.queries";
import { useProjectStore } from "../../features/projects/project.store";
import { findProject, getProjectNavPath, getProjectSwitchPath, getRouteProjectId } from "../../features/projects/project.routes";
import { BrandLogo } from "../ui/Logo";

export function MobileDrawer() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const previousPathname = useRef(location.pathname);
  const navigate = useNavigate();
  const { data } = useProjects();
  const lastProjectId = useProjectStore((state) => state.lastProjectId);
  const setLastProject = useProjectStore((state) => state.setLastProject);

  const projects = data?.content ?? [];
  const routeProjectId = getRouteProjectId(location.pathname);
  const currentProjectId = routeProjectId ?? lastProjectId;
  const currentProject = findProject(projects, currentProjectId);

  useEffect(() => {
    if (previousPathname.current === location.pathname) {
      return undefined;
    }

    previousPathname.current = location.pathname;
    if (!isOpen) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setIsOpen(false), 0);
    return () => window.clearTimeout(timeoutId);
  }, [isOpen, location.pathname]);

  const handleProjectSelect = (project: { id: string }) => {
    setLastProject(project.id);
    navigate(getProjectSwitchPath(location.pathname, project.id));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div className="fixed top-0 left-0 z-20 flex h-14 items-center px-4 md:hidden">
        <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="mr-2">
          <Menu className="h-5 w-5" />
          <span className="sr-only">{t("common:navigation.toggleMenu")}</span>
        </Button>
        </DialogTrigger>
      </div>

      <DialogContent className="left-0 top-0 h-dvh w-72 max-w-[85vw] translate-x-0 translate-y-0 gap-0 rounded-none p-0 sm:rounded-none">
        <DialogTitle className="sr-only">{t("common:navigation.menu")}</DialogTitle>
        <aside className="flex h-full flex-col bg-surface shadow-xl">
            <div className="flex h-14 items-center border-b px-4">
              <Link to="/" className="flex items-center">
                <BrandLogo hideTextOnMobile={false} textClassName="text-sm" />
              </Link>
            </div>
            
            <ProjectSwitcher 
              projects={projects} 
              currentProject={currentProject}
              onProjectSelect={handleProjectSelect}
            />

            <nav className="flex-1 overflow-y-auto py-2">
              <ul className="grid gap-1 px-2">
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
                              : "text-muted-foreground hover:bg-elevated hover:text-foreground"
                          )}
                        >
                          <item.icon className="h-5 w-5 shrink-0" />
                          <span>{label}</span>
                        </Link>
                      ) : (
                      <button
                        type="button"
                        disabled
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          "w-full cursor-not-allowed text-muted-foreground opacity-50"
                        )}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        <span>{label}</span>
                      </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>
      </DialogContent>
    </Dialog>
  );
}
