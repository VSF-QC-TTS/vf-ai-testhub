import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, FolderPlus } from "lucide-react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api/errors";
import { getProjectSchema, type ProjectFormData } from "../projects.schemas";
import { useProjectStore } from "../project.store";
import { projectTargetsPath } from "../project.routes";
import { useCreateProject } from "../projects.queries";

export function ProjectCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setLastProject = useProjectStore((state) => state.setLastProject);
  const createMutation = useCreateProject();

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(getProjectSchema(t)),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = (data: ProjectFormData) => {
    createMutation.mutate(data, {
      onSuccess: (project) => {
        setLastProject(project.id);
        navigate(projectTargetsPath(project.id), { replace: true });
      },
    });
  };

  const errorCode = createMutation.error instanceof ApiError ? createMutation.error.code : undefined;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 py-8">
      <Button asChild variant="ghost" className="w-fit gap-2 px-0 text-muted-foreground hover:bg-transparent">
        <Link to="/projects">
          <ArrowLeft className="h-4 w-4" />
          {t("projects:create.back")}
        </Link>
      </Button>

      <div className="rounded-lg border bg-surface p-6 shadow-sm">
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <FolderPlus className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t("projects:create.title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("projects:create.desc")}</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("projects:form.name")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("projects:form.namePlaceholder")} disabled={createMutation.isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("projects:form.description")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("projects:form.descPlaceholder")}
                      disabled={createMutation.isPending}
                      className="min-h-28"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {createMutation.error ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
              >
                {errorCode ? t(`api:${errorCode}`, { defaultValue: t("errors:unknown") }) : t("errors:unknown")}
              </motion.div>
            ) : null}

            <div className="flex justify-end gap-3 border-t pt-6">
              <Button asChild type="button" variant="outline" disabled={createMutation.isPending}>
                <Link to="/projects">{t("projects:form.cancel")}</Link>
              </Button>
              <Button type="submit" disabled={createMutation.isPending} className="min-w-32">
                {createMutation.isPending ? t("projects:form.creating") : t("projects:create.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
