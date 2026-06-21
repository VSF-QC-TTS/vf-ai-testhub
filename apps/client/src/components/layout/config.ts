import { Home, Target, FileText, PlayCircle, BarChart3, Settings, Database } from "lucide-react";

export const navItems = [
  { icon: Home, i18nKey: "common:home", to: "/", projectScoped: false },
  { icon: Target, i18nKey: "targets:title", to: "/targets", projectScoped: true },
  { icon: Database, i18nKey: "datasets:title", to: "/datasets", projectScoped: true },
  { icon: FileText, i18nKey: "testCases:title", to: "/test-cases", projectScoped: true },
  { icon: PlayCircle, i18nKey: "runs:title", to: "/runs", projectScoped: true },
  { icon: BarChart3, i18nKey: "reports:title", to: "/reports", projectScoped: true },
  { icon: Settings, i18nKey: "common:settings", to: "/settings", projectScoped: false },
];
