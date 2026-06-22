import { Home, Target, FileText, PlayCircle, BarChart3, Settings, Database } from "lucide-react";
import type { ProjectModule } from "../../features/projects/project.routes";

export type NavItemConfig = {
  icon: typeof Home;
  i18nKey: string;
  module?: ProjectModule;
};

export const navItems = [
  { icon: Home, i18nKey: "common:home", module: undefined },
  { icon: Database, i18nKey: "datasets:title", module: "datasets" },
  { icon: FileText, i18nKey: "testCases:title", module: "test-cases" },
  { icon: PlayCircle, i18nKey: "runs:title", module: "runs" },
  { icon: BarChart3, i18nKey: "reports:title", module: "reports" },
  { icon: Target, i18nKey: "targets:title", module: "targets" },
  { icon: Settings, i18nKey: "common:settings", module: "settings" },
] satisfies ReadonlyArray<NavItemConfig>;
