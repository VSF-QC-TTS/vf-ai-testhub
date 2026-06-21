import { Home, FolderClosed, Target, FileText, PlayCircle, BarChart3, Settings, Database } from "lucide-react";

export const navItems = [
  { icon: Home, i18nKey: "common:home", to: "/" },
  { icon: FolderClosed, i18nKey: "projects:title", to: "/projects" },
  { icon: Target, i18nKey: "targets:title", to: "/targets" },
  { icon: Database, i18nKey: "datasets:title", to: "/datasets" },
  { icon: FileText, i18nKey: "testCases:title", to: "/test-cases" },
  { icon: PlayCircle, i18nKey: "runs:title", to: "/runs" },
  { icon: BarChart3, i18nKey: "reports:title", to: "/reports" },
  { icon: Settings, i18nKey: "common:settings", to: "/settings" },
];
