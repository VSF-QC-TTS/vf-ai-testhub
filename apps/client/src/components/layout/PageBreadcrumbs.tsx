import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useProjects } from "../../features/projects/projects.queries";
import { useProjectStore } from "../../features/projects/project.store";
import { findProject, getRouteProjectId } from "../../features/projects/project.routes";

export function PageBreadcrumbs() {
  const location = useLocation();
  const paths = location.pathname.split("/").filter(Boolean);
  const { t } = useTranslation();
  const { data } = useProjects();
  const lastProjectId = useProjectStore((state) => state.lastProjectId);
  const projects = data?.content ?? [];
  const routeProjectId = getRouteProjectId(location.pathname);
  const currentProject = findProject(projects, routeProjectId ?? lastProjectId);

  if (paths.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-sm text-muted-foreground whitespace-nowrap mb-6">
      {paths.map((path, index) => {
        const routeTo = `/${paths.slice(0, index + 1).join("/")}`;
        const isLast = index === paths.length - 1;

        const translationKey = `nav.${path}`;
        const translated = t(translationKey);
        const name = (() => {
          if (translated !== translationKey && translated !== path && translated !== `nav.${path}`) {
            return translated;
          }

          if (currentProject && path === currentProject.id) {
            return currentProject.name;
          }

          if (path.length > 20 && path.includes("-")) {
            return `${path.substring(0, 8)}...`;
          }

          return path.charAt(0).toUpperCase() + path.slice(1);
        })();

        return (
          <div key={path} className="flex items-center">
            {index > 0 && <ChevronRight className="mx-1 h-4 w-4 shrink-0 opacity-50" />}
            {isLast ? (
              <span className="font-medium text-foreground" aria-current="page">{name}</span>
            ) : (
              <Link to={routeTo} className="hover:text-foreground transition-colors">{name}</Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
