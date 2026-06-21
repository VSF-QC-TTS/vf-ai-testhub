import { Navigate, Outlet } from "react-router-dom";
import { useProjectStore } from "../../features/projects/project.store";

export function FirstRunProjectGate() {
  const selectedProjectId = useProjectStore((state) => state.selectedProjectId);
  
  // Note: In Epic 4, we will fetch the list of projects here if not already fetched.
  // For now, we'll just check if a project is selected.
  // If not, redirect to a project selection/creation page.
  
  if (!selectedProjectId) {
    // Placeholder redirect for now
    return <Navigate to="/projects" replace />;
  }

  return <Outlet />;
}
