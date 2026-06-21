import { Home, FolderClosed, Target, FileText, PlayCircle, BarChart3, Settings, Database } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { type ComponentProps } from "react";

import { ProjectSwitcher } from "./ProjectSwitcher";

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

export function Sidebar({ className, ...props }: ComponentProps<"aside">) {
  const location = useLocation();
  
  // Placeholder mock data
  const mockProjects = [
    { id: "1", name: "EvalDesk Beta" },
    { id: "2", name: "Customer LLM Eval" }
  ];

  return (
    <aside 
      className={cn(
        "fixed inset-y-0 left-0 z-10 hidden flex-col border-r bg-surface md:flex md:w-16 lg:w-64 transition-all duration-300", 
        className
      )} 
      {...props}
    >
      <div className="flex h-14 lg:h-16 items-center border-b px-4 lg:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold text-primary">
          <Target className="h-6 w-6 shrink-0" />
          <span className="hidden lg:inline-block">EvalDesk</span>
        </Link>
      </div>
      
      <ProjectSwitcher 
        projects={mockProjects} 
        currentProject={mockProjects[0]}
        className="hidden lg:block"
      />
      <ProjectSwitcher 
        projects={mockProjects} 
        currentProject={mockProjects[0]}
        className="md:block lg:hidden"
        isCollapsed
      />

      <nav className="flex-1 overflow-y-auto py-2">
        <ul className="grid gap-1 px-2 lg:px-4">
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
                      : "text-muted-foreground hover:bg-elevated hover:text-foreground",
                    "md:justify-center lg:justify-start"
                  )}
                  title={item.label}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span className="hidden lg:inline-block truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
