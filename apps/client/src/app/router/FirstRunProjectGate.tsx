import { Navigate, Outlet } from "react-router-dom";
import { useProjectStore } from "../../features/projects/project.store";

export function FirstRunProjectGate() {
  const activeProjectId = useProjectStore((state) => state.activeProjectId);
  
  // Note: In Epic 4, we will fetch the list of projects here if not already fetched.
  // For now, we'll just check if a project is selected.
  // If not, redirect to a project selection/creation page.
  
  if (!activeProjectId) {
    // Placeholder redirect for now
    return <Navigate to="/projects" replace />;
  }

  return <Outlet />;
}
