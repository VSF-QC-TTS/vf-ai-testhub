import { Menu, Target, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Reusing navItems from Sidebar (in a real app, extract this to a config file)
import { Home, FolderClosed, FileText, PlayCircle, BarChart3, Settings, Database } from "lucide-react";
const navItems = [
  { icon: Home, label: "Home", to: "/" },
  { icon: FolderClosed, label: "Projects", to: "/projects" },
  { icon: Target, label: "Targets", to: "/targets" },
  { icon: Database, label: "Datasets", to: "/datasets" },
  { icon: FileText, label: "Test Cases", to: "/test-cases" },
  { icon: PlayCircle, label: "Runs", to: "/runs" },
  { icon: BarChart3, label: "Reports", to: "/reports" },
  { icon: Settings, label: "Settings", to: "/settings" },
];

import { ProjectSwitcher } from "./ProjectSwitcher";

export function MobileDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const [prevPathname, setPrevPathname] = useState(location.pathname);
  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname);
    setIsOpen(false);
  }

  // Placeholder mock data
  const mockProjects = [
    { id: "1", name: "EvalDesk Beta" },
    { id: "2", name: "Customer LLM Eval" }
  ];

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
              <Link to="/" className="flex items-center gap-2 font-semibold text-primary">
                <Target className="h-6 w-6 shrink-0" />
                <span>EvalDesk</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
                <span className="sr-only">Close Menu</span>
              </Button>
            </div>
            
            <ProjectSwitcher 
              projects={mockProjects} 
              currentProject={mockProjects[0]}
            />

            <nav className="flex-1 overflow-y-auto py-2">
              <ul className="grid gap-1 px-2">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to));
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          isActive 
                            ? "bg-primary text-primary-foreground" 
                            : "text-muted-foreground hover:bg-elevated hover:text-foreground"
                        )}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        <span>{item.label}</span>
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
