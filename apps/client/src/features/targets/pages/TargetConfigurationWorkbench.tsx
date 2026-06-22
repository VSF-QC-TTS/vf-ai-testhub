import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Save, Play, Code, 
  Settings2, Braces, Link2, KeyRound 
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../../components/ui/form";
import { Input } from "../../../components/ui/Input";
import { Textarea } from "../../../components/ui/textarea";
import { getTargetSchema, type TargetFormData } from "../targets.schemas";
import { useTarget, useCreateTarget, useUpdateTarget, useParseCurl } from "../targets.queries";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { projectTargetsPath } from "../../projects/project.routes";
import { ApiError } from "@/lib/api/errors";
import { toast } from "sonner";

const SELECT_CLASS = "flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300 transition-colors hover:border-zinc-400 dark:hover:border-zinc-600";

function SectionHeader({ icon: Icon, title, className = "mb-4" }: { icon: React.ElementType; title: string; className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 flex items-center justify-center border border-transparent dark:border-zinc-700/50">
        <Icon className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
      </div>
      <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{title}</h2>
    </div>
  );
}

export function TargetConfigurationWorkbench() {
  const { projectId = "", targetId } = useParams();
  const isNew = !targetId;
  const navigate = useNavigate();
  const { t } = useTranslation();
  const listPath = projectTargetsPath(projectId);
  const { data: target, isLoading: isLoadingTarget } = useTarget(targetId ?? "");
  
  const createMutation = useCreateTarget();
  const updateMutation = useUpdateTarget(targetId ?? "");
  const parseCurlMutation = useParseCurl();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error ?? updateMutation.error;
  const errorCode = mutationError instanceof ApiError ? mutationError.code : undefined;

  const [curlInput, setCurlInput] = useState("");
  const [headersJson, setHeadersJson] = useState("");
  const [bodyJson, setBodyJson] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  const form = useForm<TargetFormData>({
    resolver: zodResolver(getTargetSchema(t)),
    defaultValues: {
      projectId,
      name: "",
      environment: "dev",
      targetType: "HTTP",
      method: "POST",
      url: "",
      isDefault: false,
    },
  });

  useEffect(() => {
    if (target && !isNew) {
      form.reset({
        projectId: target.projectId,
        name: target.name,
        environment: target.environment,
        targetType: target.targetType,
        method: target.method,
        url: target.url,
        isDefault: target.isDefault,
        timeoutMs: target.timeoutMs,
        responseMapping: target.responseMapping,
      });
      setHeadersJson(target.headersTemplate ? JSON.stringify(target.headersTemplate, null, 2) : "");
      setBodyJson(target.bodyTemplate ? JSON.stringify(target.bodyTemplate, null, 2) : "");
    }
  }, [target, isNew, form]);

  useEffect(() => {
    if (isNew) {
      form.setValue("projectId", projectId);
    }
  }, [form, isNew, projectId]);

  const handleParseCurl = async () => {
    if (!/\S/.test(curlInput)) return;
    try {
      const parsed = await parseCurlMutation.mutateAsync(curlInput);
      if (parsed.method) form.setValue("method", parsed.method);
      if (parsed.url) form.setValue("url", parsed.url);
      if (parsed.headersTemplate) setHeadersJson(JSON.stringify(parsed.headersTemplate, null, 2));
      if (parsed.bodyTemplate) setBodyJson(JSON.stringify(parsed.bodyTemplate, null, 2));
      setCurlInput(""); // Clear after success
      toast.success(t("common:success"));
    } catch (e) {
      console.error("Failed to parse cURL", e);
      toast.error(t("common:error"));
    }
  };

  const onSubmit = (data: TargetFormData) => {
    setJsonError(null);
    let parsedHeaders = undefined;
    let parsedBody = undefined;

    try {
      if (headersJson.trim()) parsedHeaders = JSON.parse(headersJson);
    } catch (e) {
      setJsonError("Invalid JSON in Headers");
      return;
    }

    try {
      if (bodyJson.trim()) parsedBody = JSON.parse(bodyJson);
    } catch (e) {
      setJsonError("Invalid JSON in Body");
      return;
    }

    const payload = {
      ...data,
      projectId,
      headersTemplate: parsedHeaders,
      bodyTemplate: parsedBody
    };

    if (isNew) {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success(t("common:success"));
          navigate(listPath);
        },
        onError: () => toast.error(t("common:error"))
      });
    } else {
      updateMutation.mutate(payload, {
        onSuccess: () => {
          toast.success(t("common:success"));
          navigate(listPath);
        },
        onError: () => toast.error(t("common:error"))
      });
    }
  };

  if (!projectId) return <div className="p-8 text-center text-muted-foreground">{t("targets:missingProject")}</div>;
  if (isLoadingTarget && !isNew) return <div className="p-8">Loading...</div>;
  if (!isNew && !target) return <div className="p-8 text-center text-muted-foreground">{t("targets:notFound")}</div>;

  return (
    <div className="flex flex-col h-full w-full max-w-7xl mx-auto px-4 md:px-0 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mt-8 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(listPath)} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{isNew ? t("targets:workbench.createTitle") : t("targets:workbench.editTitle")}</h1>
            <p className="text-sm text-muted-foreground">{isNew ? t("targets:workbench.createDesc") : target?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(listPath)}>{t("common:actions.cancel")}</Button>
          <Button type="button" onClick={form.handleSubmit(onSubmit)} disabled={isPending} className="gap-2">
            <Save className="h-4 w-4" />
            {isNew ? t("targets:create") : t("common:actions.saveChanges")}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Configuration */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick cURL Import */}
            <div className="relative overflow-hidden bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 dark:opacity-20 pointer-events-none" />
              <SectionHeader icon={Code} title={t("targets:workbench.quickImport.title")} />
              <div className="flex gap-3">
                <Textarea
                  placeholder={t("targets:workbench.quickImport.placeholder")}
                  value={curlInput}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setCurlInput(e.target.value)}
                  className="font-mono text-sm min-h-[100px]"
                />
                <Button
                  type="button"
                  variant="secondary"
                  className="h-auto px-6 whitespace-nowrap"
                  onClick={handleParseCurl}
                  disabled={parseCurlMutation.isPending || !/\S/.test(curlInput)}
                >
                  {parseCurlMutation.isPending ? t("targets:workbench.quickImport.parsing") : t("targets:workbench.quickImport.parse")}
                </Button>
              </div>
            </div>

            {/* HTTP Configuration */}
            <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 p-6 rounded-3xl shadow-sm space-y-6 hover:shadow-md transition-shadow">
              <SectionHeader icon={Link2} title={t("targets:workbench.httpConfig.title")} className="mb-2" />

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="method"
                  render={({ field }) => (
                    <FormItem className="md:col-span-1">
                      <FormLabel>{t("targets:workbench.httpConfig.method")}</FormLabel>
                      <FormControl>
                        <select
                          className={SELECT_CLASS}
                          {...field}
                          value={field.value || "POST"}
                        >
                          <option value="GET">GET</option>
                          <option value="POST">POST</option>
                          <option value="PUT">PUT</option>
                          <option value="PATCH">PATCH</option>
                          <option value="DELETE">DELETE</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem className="md:col-span-3">
                      <FormLabel>{t("targets:workbench.httpConfig.url")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("targets:workbench.httpConfig.urlPlaceholder")} className="font-mono text-sm" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Tabs defaultValue="headers" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="headers">{t("targets:workbench.httpConfig.headers")}</TabsTrigger>
                  <TabsTrigger value="body">{t("targets:workbench.httpConfig.body")}</TabsTrigger>
                  <TabsTrigger value="auth">{t("targets:workbench.httpConfig.auth")}</TabsTrigger>
                </TabsList>
                <TabsContent value="headers" className="p-4 bg-zinc-50 dark:bg-zinc-900/30 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  <p className="text-sm text-muted-foreground mb-4">{t("targets:workbench.httpConfig.headersDesc")}</p>
                  <Textarea
                    placeholder='{\n  "Content-Type": "application/json",\n  "X-Custom-Header": "{{my_var}}"\n}'
                    className="font-mono text-sm min-h-[150px]"
                    value={headersJson}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setHeadersJson(e.target.value)}
                  />
                </TabsContent>
                <TabsContent value="body" className="p-4 bg-zinc-50 dark:bg-zinc-900/30 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  <p className="text-sm text-muted-foreground mb-4">{t("targets:workbench.httpConfig.bodyDesc")}</p>
                  <Textarea
                    placeholder='{\n  "query": "{{input}}",\n  "session_id": "{{session_id}}"\n}'
                    className="font-mono text-sm min-h-[200px]"
                    value={bodyJson}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setBodyJson(e.target.value)}
                  />
                </TabsContent>
                <TabsContent value="auth" className="p-4 bg-zinc-50 dark:bg-zinc-900/30 rounded-xl border border-zinc-100 dark:border-zinc-800 flex items-center justify-center min-h-[200px] text-zinc-500">
                  <div className="text-center">
                    <KeyRound className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>{t("targets:workbench.httpConfig.authDesc")}</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Response Mapping */}
            <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 p-6 rounded-3xl shadow-sm space-y-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <SectionHeader icon={Braces} title={t("targets:workbench.responseMapping.title")} className="mb-0" />
                <div className="text-sm bg-zinc-100 dark:bg-zinc-900 px-3 py-1 rounded-full text-zinc-500 font-mono">
                  JSONPath
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{t("targets:workbench.responseMapping.desc")}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-50 dark:bg-zinc-900/30 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <FormField
                  control={form.control}
                  name="responseMapping.answerPath"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("targets:workbench.responseMapping.answerPath")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("targets:workbench.responseMapping.answerPathPlaceholder")} className="font-mono text-sm" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="responseMapping.sourcesPath"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("targets:workbench.responseMapping.sourcesPath")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("targets:workbench.responseMapping.sourcesPathPlaceholder")} className="font-mono text-sm" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="responseMapping.latencyPath"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("targets:workbench.responseMapping.latencyPath")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("targets:workbench.responseMapping.latencyPathPlaceholder")} className="font-mono text-sm" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="responseMapping.missingFieldBehavior"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("targets:workbench.responseMapping.missingFieldBehavior")}</FormLabel>
                      <FormControl>
                        <select
                          className={SELECT_CLASS}
                          {...field}
                          value={field.value || "FAIL"}
                        >
                          <option value="FAIL">{t("targets:workbench.responseMapping.fail")}</option>
                          <option value="SKIP">{t("targets:workbench.responseMapping.skip")}</option>
                          <option value="WARNING">{t("targets:workbench.responseMapping.warning")}</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Sidebar / Metadata */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 p-6 rounded-3xl shadow-sm space-y-6 hover:shadow-md transition-shadow">
              <SectionHeader icon={Settings2} title={t("targets:workbench.settings.title")} className="mb-2" />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("targets:workbench.settings.name")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("targets:workbench.settings.namePlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="environment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("targets:workbench.settings.environment")}</FormLabel>
                    <FormControl>
                      <select
                        className={SELECT_CLASS}
                        {...field}
                        value={field.value || "dev"}
                      >
                        <option value="dev">{t("targets:workbench.settings.envDev")}</option>
                        <option value="staging">{t("targets:workbench.settings.envStaging")}</option>
                        <option value="prod">{t("targets:workbench.settings.envProd")}</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeoutMs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("targets:workbench.settings.timeout")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="30000"
                        {...field}
                        value={field.value || ""}
                        onChange={e => field.onChange(parseInt(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900">
                <Button type="button" variant="outline" className="w-full gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700">
                  <Play className="h-4 w-4" />
                  {t("targets:workbench.settings.testConnection")}
                </Button>
              </div>

              {mutationError && !jsonError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20 mt-4"
                >
                  {errorCode ? t(`api:${errorCode}`, { defaultValue: t("errors:unknown") }) : t("errors:unknown")}
                </motion.div>
              )}

              {jsonError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20 mt-4"
                >
                  {jsonError}
                </motion.div>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

