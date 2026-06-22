import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProjectStore {
  lastProjectId: string | null;
  setLastProject: (id: string) => void;
  clearLastProject: () => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      lastProjectId: null,
      setLastProject: (id) => set({ lastProjectId: id }),
      clearLastProject: () => set({ lastProjectId: null }),
    }),
    {
      name: "vf-project-storage",
      version: 1,
      migrate: (persistedState: unknown) => {
        if (typeof persistedState !== "object" || persistedState === null) {
          return { lastProjectId: null };
        }

        const state = persistedState as { activeProjectId?: unknown; lastProjectId?: unknown };
        return {
          lastProjectId:
            typeof state.lastProjectId === "string"
              ? state.lastProjectId
              : typeof state.activeProjectId === "string"
                ? state.activeProjectId
                : null,
        };
      },
    }
  )
);
