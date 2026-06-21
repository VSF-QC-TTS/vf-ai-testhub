// Query key factories for TanStack Query

export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    session: () => [...queryKeys.auth.all, "session"] as const,
  },
  projects: {
    all: ["projects"] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.projects.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.projects.all, "detail", id] as const,
  },
  targets: {
    all: ["targets"] as const,
    list: (projectId: string, filters?: Record<string, unknown>) => [...queryKeys.targets.all, projectId, "list", filters] as const,
    detail: (id: string) => [...queryKeys.targets.all, "detail", id] as const,
  },
  datasets: {
    all: ["datasets"] as const,
    list: (projectId: string, filters?: Record<string, unknown>) => [...queryKeys.datasets.all, projectId, "list", filters] as const,
    detail: (id: string) => [...queryKeys.datasets.all, "detail", id] as const,
  },
  testCases: {
    all: ["testCases"] as const,
    list: (datasetId: string, filters?: Record<string, unknown>) => [...queryKeys.testCases.all, datasetId, "list", filters] as const,
  },
  runs: {
    all: ["runs"] as const,
    list: (datasetId: string, filters?: Record<string, unknown>) => [...queryKeys.runs.all, datasetId, "list", filters] as const,
    detail: (id: string) => [...queryKeys.runs.all, "detail", id] as const,
    report: (id: string) => [...queryKeys.runs.all, "report", id] as const,
  },
  rubrics: {
    all: ["rubrics"] as const,
    list: (projectId: string, filters?: Record<string, unknown>) => [...queryKeys.rubrics.all, projectId, "list", filters] as const,
    global: (filters?: Record<string, unknown>) => [...queryKeys.rubrics.all, "global", "list", filters] as const,
  }
};
