import type { ProjectResponse } from "./projects.types";

export const PROJECT_ROUTE_PREFIX = "/projects";

const PROJECT_MODULES = ["dashboard", "targets", "rubrics", "datasets", "test-cases", "runs", "experiments", "reports", "settings"] as const;

export type ProjectModule = (typeof PROJECT_MODULES)[number];

export function getRouteProjectId(pathname: string): string | null {
  const [, root, projectId] = pathname.split("/");
  if (root !== "projects" || !projectId || projectId === "new") {
    return null;
  }

  return decodeURIComponent(projectId);
}

export function isProjectModule(value: string | undefined): value is ProjectModule {
  return PROJECT_MODULES.includes(value as ProjectModule);
}

export function projectOverviewPath(projectId: string): string {
  return `${PROJECT_ROUTE_PREFIX}/${projectId}/dashboard`;
}

export function projectTargetsPath(projectId: string): string {
  return `${PROJECT_ROUTE_PREFIX}/${projectId}/targets`;
}

export function projectModulePath(projectId: string, module?: ProjectModule): string {
  return module && module !== "dashboard" ? `${PROJECT_ROUTE_PREFIX}/${projectId}/${module}` : projectOverviewPath(projectId);
}

export function getProjectNavPath(projectId: string | null, module?: ProjectModule): string | null {
  return projectId ? projectModulePath(projectId, module) : null;
}

export function getProjectSwitchPath(pathname: string, nextProjectId: string): string {
  const [, root, , module] = pathname.split("/");
  if (root === "projects" && isProjectModule(module)) {
    return projectModulePath(nextProjectId, module);
  }

  return projectOverviewPath(nextProjectId);
}

export function findProject(projects: readonly ProjectResponse[], projectId: string | null): ProjectResponse | undefined {
  return projectId ? projects.find((project) => project.id === projectId) : undefined;
}
