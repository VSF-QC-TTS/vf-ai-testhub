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
import { useLogout } from "../../features/auth/auth.queries";

import { useThemePreference } from "./useThemePreference";
import { Check, LogOut, Moon, Settings, Sun, User } from "lucide-react";
import { useAuthStore } from "../../features/auth/auth.store";
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
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogout();
  const lastProjectId = useProjectStore((state) => state.lastProjectId);
  const setLastProject = useProjectStore((state) => state.setLastProject);
  const { isDark, toggleTheme } = useThemePreference();
  
  const projects = data?.content ?? [];
  const routeProjectId = getRouteProjectId(location.pathname);
  const currentProjectId = routeProjectId ?? lastProjectId;
  const currentProject = findProject(projects, currentProjectId);

  const handleProjectSelect = (project: { id: string }) => {
    setLastProject(project.id);
    navigate(getProjectSwitchPath(location.pathname, project.id));
  };

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => navigate("/login", { replace: true }),
    });
  };

  const displayName = user?.displayName || user?.email || t("common:navigation.myAccount", "My Account");
  const userSubtitle = user?.role || user?.email || t("common:navigation.profile", "Profile");
  const initials = getInitials(displayName);

  return (
    <aside 
      className={cn(
        "fixed inset-y-0 left-0 z-10 hidden flex-col border-r border-border bg-surface text-foreground md:flex md:w-16 lg:w-64 transition-all duration-300 dark:border-[#252b35] dark:bg-[#15181d] dark:text-zinc-100", 
        className
      )} 
      {...props}
    >
      <div className="flex h-14 lg:h-16 items-center px-4 lg:px-6">
        <Link to="/" className="flex items-center">
          <BrandLogo
            hideTextOnMobile
            iconClassName="bg-primary text-primary-foreground"
            textClassName="text-sm text-foreground dark:text-zinc-50"
          />
        </Link>
      </div>

      <div className="border-b border-border pb-2 mb-2 dark:border-white/10">
        <ProjectSwitcher
          projects={projects}
          currentProject={currentProject}
          onProjectSelect={handleProjectSelect}
          className="hidden lg:block"
          tone="sidebar"
        />
        <ProjectSwitcher
          projects={projects}
          currentProject={currentProject}
          onProjectSelect={handleProjectSelect}
          className="md:block lg:hidden"
          isCollapsed
          tone="sidebar"
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
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary dark:bg-white/10 dark:text-white"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground dark:text-zinc-400 dark:hover:bg-white/[0.07] dark:hover:text-zinc-50",
                      "md:justify-center lg:justify-start"
                    )}
                    title={label}
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground dark:bg-white/[0.07] dark:text-zinc-400"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                    </span>
                    <span className="hidden lg:inline-block truncate">{label}</span>
                  </Link>
                ) : (
                <button
                  type="button"
                  disabled
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    "w-full cursor-not-allowed text-muted-foreground opacity-60 dark:text-zinc-500",
                    "md:justify-center lg:justify-start"
                  )}
                  title={label}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground dark:bg-white/[0.04] dark:text-zinc-500">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <span className="hidden lg:inline-block truncate">{label}</span>
                </button>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border bg-muted/30 p-3 mt-auto dark:border-white/10 dark:bg-black/10 lg:p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-12 w-full justify-center gap-3 px-2 text-left hover:bg-muted dark:hover:bg-white/10 lg:justify-start lg:px-3"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-border dark:ring-white/10"
                />
              ) : (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {initials}
                </span>
              )}
              <span className="hidden min-w-0 flex-1 lg:block">
                <span className="block truncate text-sm font-semibold">{displayName}</span>
                <span className="block truncate text-xs text-muted-foreground dark:text-zinc-400">{userSubtitle}</span>
              </span>
              <span className="sr-only">{t("common:navigation.toggleUserMenu", "Toggle user menu")}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="right" sideOffset={12} className="w-64">
            <DropdownMenuLabel className="flex items-center gap-3">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {initials}
                </span>
              )}
              <span className="min-w-0">
                <span className="block truncate">{displayName}</span>
                <span className="block truncate text-xs font-normal text-muted-foreground">{user?.email}</span>
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="h-4 w-4" />
              {t("common:navigation.profile", "Profile")}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="h-4 w-4" />
              {t("common:navigation.settings", "Settings")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={toggleTheme}>
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {isDark ? t("common:navigation.lightMode", "Light mode") : t("common:navigation.darkMode", "Dark mode")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => i18n.changeLanguage("vi")}>
              <Check className={cn("h-4 w-4", i18n.language === "vi" ? "opacity-100" : "opacity-0")} />
              Tiếng Việt
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => i18n.changeLanguage("en")}>
              <Check className={cn("h-4 w-4", i18n.language === "en" ? "opacity-100" : "opacity-0")} />
              English
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              disabled={logoutMutation.isPending}
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              {t("common:navigation.logout", "Logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

function getInitials(value: string): string {
  const words = value.trim().split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? "U";
  const second = words.length > 1 ? words[words.length - 1]?.[0] : undefined;
  return `${first}${second ?? ""}`.toUpperCase();
}
