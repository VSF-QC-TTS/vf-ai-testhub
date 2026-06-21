import { Home, FolderClosed, Target, FileText, PlayCircle, BarChart3, Settings, Database } from "lucide-react";

export const navItems = [
  { icon: Home, label: "Home", to: "/" },
  { icon: FolderClosed, label: "Projects", to: "/projects" },
  { icon: Target, label: "Targets", to: "/targets" },
  { icon: Database, label: "Datasets", to: "/datasets" },
  { icon: FileText, label: "Test Cases", to: "/test-cases" },
  { icon: PlayCircle, label: "Runs", to: "/runs" },
  { icon: BarChart3, label: "Reports", to: "/reports" },
  { icon: Settings, label: "Settings", to: "/settings" },
];
