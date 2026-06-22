import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { useExperiments } from "../experiments.queries";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export function ExperimentListPage() {
  const { t } = useTranslation();
  const { projectId = "" } = useParams();
  
  const { data, isLoading } = useExperiments(projectId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b pb-4 mt-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("experiments.title")}</h1>
        </div>
        <Button asChild>
          <Link to="new">
            <Plus className="mr-2 h-4 w-4" />
            {t("experiments.create")}
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("experiments.fields.name")}</TableHead>
              <TableHead>{t("experiments.fields.status")}</TableHead>
              <TableHead>{t("experiments.fields.createdAt")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : !data || data.content.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center h-32">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-muted-foreground">{t("experiments.empty.description")}</p>
                    <Button variant="outline" asChild className="mt-2">
                      <Link to="new">{t("experiments.create")}</Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.content.map((experiment) => (
                <TableRow key={experiment.publicId}>
                  <TableCell className="font-medium">
                    <Link to={experiment.publicId} className="hover:underline text-primary">
                      {experiment.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                      experiment.status === "COMPLETED" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                      experiment.status === "FAILED" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                      "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                    }`}>
                      {experiment.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(experiment.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
