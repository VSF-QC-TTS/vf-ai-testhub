import { type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopHeader } from "./TopHeader";
import { MobileDrawer } from "./MobileDrawer";
import { PageBreadcrumbs } from "./PageBreadcrumbs";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <MobileDrawer />
      <div className="flex flex-1 flex-col md:pl-16 lg:pl-64">
        {/* TopHeader is only visible on mobile (md:hidden) */}
        <TopHeader />
        <main className="flex-1 p-4 sm:px-6 md:p-8 max-w-7xl mx-auto w-full">
          <div className="hidden md:block">
            <PageBreadcrumbs />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
