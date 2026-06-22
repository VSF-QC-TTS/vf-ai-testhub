import { useTranslation } from "react-i18next";

export function PlaceholderPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold tracking-tight">{t("common:comingSoon.title")}</h1>
      <p className="text-muted-foreground">{t("common:comingSoon.desc")}</p>
    </div>
  );
}

export function ErrorBoundary() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-4xl font-bold text-destructive">{t("errors:boundaryTitle")}</h1>
      <p className="text-muted-foreground">{t("errors:boundaryDesc")}</p>
    </div>
  );
}
