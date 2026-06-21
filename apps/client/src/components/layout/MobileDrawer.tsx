import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { useTranslation } from "react-i18next";
import { navItems } from "./config";
import { ProjectSwitcher } from "./ProjectSwitcher";
import { useProjects } from "../../features/projects/projects.queries";
import { useProjectStore } from "../../features/projects/project.store";
import { BrandLogo } from "../ui/Logo";

export function MobileDrawer() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { data } = useProjects();
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const setActiveProject = useProjectStore((s) => s.setActiveProject);

  const projects = data?.content || [];
  const currentProject = projects.find(p => p.id === activeProjectId);

  const [prevPathname, setPrevPathname] = useState(location.pathname);
  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname);
    setIsOpen(false);
  }

  return (
    <div className="md:hidden">
      <div className="fixed top-0 left-0 z-20 flex h-14 items-center px-4">
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} className="mr-2">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </div>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-surface shadow-xl flex flex-col animate-in slide-in-from-left">
            <div className="flex h-14 items-center justify-between border-b px-4">
              <Link to="/" className="flex items-center">
                <BrandLogo hideTextOnMobile={false} textClassName="text-sm" />
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
                <span className="sr-only">Close Menu</span>
              </Button>
            </div>
            
            <ProjectSwitcher 
              projects={projects} 
              currentProject={currentProject}
              onProjectSelect={(p) => setActiveProject(p.id)}
            />

            <nav className="flex-1 overflow-y-auto py-2">
              <ul className="grid gap-1 px-2">
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
                          isDisabled && "opacity-50 pointer-events-none cursor-not-allowed"
                        )}
                        aria-disabled={isDisabled}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        <span>{t(item.i18nKey as any)}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>
        </>
      )}
    </div>
  );
}
