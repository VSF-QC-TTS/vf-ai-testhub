import { Outlet } from "react-router-dom";
import { Bot } from "lucide-react";
import { useTranslation } from "react-i18next";

export function AuthLayout() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">AI TestHub</h1>
          <p className="text-sm text-muted-foreground">
            {t("auth:slogan", "Quality Engineering at Scale")}
          </p>
        </div>
        
        <Outlet />
      </div>
    </div>
  );
}
