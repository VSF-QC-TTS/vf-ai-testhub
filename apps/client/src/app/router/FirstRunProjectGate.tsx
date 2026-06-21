import { Navigate, Outlet } from "react-router-dom";
import { useProjectStore } from "../../features/projects/project.store";
import { useProjects } from "../../features/projects/projects.queries";

export function FirstRunProjectGate() {
  const activeProjectId = useProjectStore((state) => state.activeProjectId);
  const { data, isLoading } = useProjects();
  
  if (isLoading) {
    return null; // Or a full-page skeleton
  }

  const projects = data?.content || [];
  
  // If no projects exist at all, send them to the first-run experience
  if (projects.length === 0) {
    return <Navigate to="/projects?empty=1" replace />;
  }
  
  // If projects exist but none is selected, send to project list
  if (!activeProjectId) {
    return <Navigate to="/projects" replace />;
  }

  return <Outlet />;
}
