import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Save, Play, Code, 
  Settings2, Braces, Link2, KeyRound, Cpu 
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../../components/ui/form";
import { Input } from "../../../components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import { getTargetSchema, type TargetFormData } from "../targets.schemas";
import { useTarget, useCreateTarget, useUpdateTarget, useParseCurl } from "../targets.queries";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { projectTargetsPath } from "../../projects/project.routes";
import { ApiError } from "@/lib/api/errors";
import { toast } from "sonner";

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
  const parseCurlMutation = useParseCurl(projectId || null);
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

  const currentTargetType = form.watch("targetType");

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
      const timeoutId = window.setTimeout(() => {
        setHeadersJson(target.headersTemplate ? JSON.stringify(target.headersTemplate, null, 2) : "");
        setBodyJson(target.bodyTemplate ? JSON.stringify(target.bodyTemplate, null, 2) : "");
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }

    return undefined;
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
    } catch {
      setJsonError("Invalid JSON in Headers");
      return;
    }

    try {
      if (bodyJson.trim()) parsedBody = JSON.parse(bodyJson);
    } catch {
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
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto px-4 md:px-0 pb-12">
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* General Information Card */}
          <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200 dark:border-zinc-800/80 p-8 rounded-[2rem] shadow-sm hover:shadow-md transition-all duration-300">
            <SectionHeader icon={Settings2} title={t("targets:workbench.generalInfo.title", "General Information")} className="mb-6" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>{t("targets:workbench.settings.name")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("targets:workbench.settings.namePlaceholder")} className="text-lg bg-zinc-50/50 dark:bg-zinc-950/50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("targets:workbench.settings.targetType", "Target Type")}</FormLabel>
                    <Select value={field.value || "HTTP"} onValueChange={field.onChange} disabled={isPending}>
                      <FormControl>
                        <SelectTrigger className="bg-zinc-50/50 dark:bg-zinc-950/50">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="HTTP">HTTP API</SelectItem>
                        <SelectItem value="LLM">Native LLM</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Select value={field.value || "dev"} onValueChange={field.onChange} disabled={isPending}>
                      <FormControl>
                        <SelectTrigger className="bg-zinc-50/50 dark:bg-zinc-950/50">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="dev">{t("targets:workbench.settings.envDev")}</SelectItem>
                        <SelectItem value="staging">{t("targets:workbench.settings.envStaging")}</SelectItem>
                        <SelectItem value="prod">{t("targets:workbench.settings.envProd")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* HTTP Configuration Card */}
          {currentTargetType === "HTTP" && (
            <div className="space-y-8">
              {/* Quick cURL Import */}
              <div className="relative overflow-hidden bg-zinc-50 dark:bg-zinc-900/30 border border-dashed border-zinc-300 dark:border-zinc-700 p-6 rounded-[2rem] hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors">
                <div className="flex gap-4 flex-col md:flex-row">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Code className="h-4 w-4 text-zinc-500" />
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("targets:workbench.quickImport.title")}</span>
                    </div>
                    <Textarea
                      placeholder={t("targets:workbench.quickImport.placeholder")}
                      value={curlInput}
                      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setCurlInput(e.target.value)}
                      className="font-mono text-sm min-h-[80px] bg-white dark:bg-zinc-950"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-10 px-6 whitespace-nowrap"
                      onClick={handleParseCurl}
                      disabled={parseCurlMutation.isPending || !/\S/.test(curlInput)}
                    >
                      {parseCurlMutation.isPending ? t("targets:workbench.quickImport.parsing") : t("targets:workbench.quickImport.parse")}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Endpoint Configuration */}
              <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200 dark:border-zinc-800/80 p-8 rounded-[2rem] shadow-sm hover:shadow-md transition-all duration-300">
                <SectionHeader icon={Link2} title={t("targets:workbench.httpConfig.title")} className="mb-6" />

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <FormField
                    control={form.control}
                    name="method"
                    render={({ field }) => (
                      <FormItem className="md:col-span-1">
                        <FormLabel>{t("targets:workbench.httpConfig.method")}</FormLabel>
                        <Select value={field.value || "POST"} onValueChange={field.onChange} disabled={isPending}>
                          <FormControl>
                            <SelectTrigger className="bg-zinc-50/50 dark:bg-zinc-950/50">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="GET">GET</SelectItem>
                            <SelectItem value="POST">POST</SelectItem>
                            <SelectItem value="PUT">PUT</SelectItem>
                            <SelectItem value="PATCH">PATCH</SelectItem>
                            <SelectItem value="DELETE">DELETE</SelectItem>
                          </SelectContent>
                        </Select>
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
                          <Input placeholder={t("targets:workbench.httpConfig.urlPlaceholder")} className="font-mono text-sm bg-zinc-50/50 dark:bg-zinc-950/50" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Tabs defaultValue="headers" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-4 bg-zinc-100/50 dark:bg-zinc-800/50 rounded-xl p-1">
                    <TabsTrigger value="headers" className="rounded-lg">{t("targets:workbench.httpConfig.headers")}</TabsTrigger>
                    <TabsTrigger value="body" className="rounded-lg">{t("targets:workbench.httpConfig.body")}</TabsTrigger>
                    <TabsTrigger value="auth" className="rounded-lg">{t("targets:workbench.httpConfig.auth")}</TabsTrigger>
                  </TabsList>
                  <TabsContent value="headers" className="p-4 bg-zinc-50/50 dark:bg-zinc-950/30 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                    <p className="text-sm text-muted-foreground mb-4">{t("targets:workbench.httpConfig.headersDesc")}</p>
                    <Textarea
                      placeholder='{\n  "Content-Type": "application/json",\n  "X-Custom-Header": "{{my_var}}"\n}'
                      className="font-mono text-sm min-h-[150px] bg-white dark:bg-zinc-900"
                      value={headersJson}
                      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setHeadersJson(e.target.value)}
                    />
                  </TabsContent>
                  <TabsContent value="body" className="p-4 bg-zinc-50/50 dark:bg-zinc-950/30 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                    <p className="text-sm text-muted-foreground mb-4">{t("targets:workbench.httpConfig.bodyDesc")}</p>
                    <Textarea
                      placeholder='{\n  "query": "{{input}}",\n  "session_id": "{{session_id}}"\n}'
                      className="font-mono text-sm min-h-[200px] bg-white dark:bg-zinc-900"
                      value={bodyJson}
                      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setBodyJson(e.target.value)}
                    />
                  </TabsContent>
                  <TabsContent value="auth" className="p-4 bg-zinc-50/50 dark:bg-zinc-950/30 rounded-xl border border-zinc-100 dark:border-zinc-800/50 flex items-center justify-center min-h-[200px] text-zinc-500">
                    <div className="text-center">
                      <KeyRound className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>{t("targets:workbench.httpConfig.authDesc")}</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}

          {/* LLM Configuration Card */}
          {currentTargetType === "LLM" && (
            <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200 dark:border-zinc-800/80 p-8 rounded-[2rem] shadow-sm hover:shadow-md transition-all duration-300">
              <SectionHeader icon={Cpu} title={t("targets:workbench.llmConfig.title", "LLM Configuration")} className="mb-6" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="llmProvider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("targets:workbench.llmConfig.provider", "Provider")}</FormLabel>
                      <Select value={field.value || ""} onValueChange={field.onChange} disabled={isPending}>
                        <FormControl>
                          <SelectTrigger className="bg-zinc-50/50 dark:bg-zinc-950/50">
                            <SelectValue placeholder="Select a provider" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="openai">OpenAI</SelectItem>
                          <SelectItem value="anthropic">Anthropic</SelectItem>
                          <SelectItem value="google">Google Gemini</SelectItem>
                          <SelectItem value="azure">Azure OpenAI</SelectItem>
                          <SelectItem value="custom">Custom Provider</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="llmModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("targets:workbench.llmConfig.model", "Model Name")}</FormLabel>
                      <FormControl>
                        <Input placeholder="gpt-4o, claude-3-5-sonnet..." className="bg-zinc-50/50 dark:bg-zinc-950/50" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="llmBaseUrl"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>{t("targets:workbench.llmConfig.baseUrl", "Base URL (Optional)")}</FormLabel>
                      <FormControl>
                        <Input placeholder="https://api.openai.com/v1" className="font-mono text-sm bg-zinc-50/50 dark:bg-zinc-950/50" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="llmKeyRef"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>{t("targets:workbench.llmConfig.keyRef", "API Key Reference (Optional)")}</FormLabel>
                      <FormControl>
                        <Input placeholder="OPENAI_API_KEY" className="font-mono text-sm bg-zinc-50/50 dark:bg-zinc-950/50" {...field} value={field.value || ""} />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">Environment variable name containing the API key.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* Response Mapping Card */}
          <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200 dark:border-zinc-800/80 p-8 rounded-[2rem] shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <SectionHeader icon={Braces} title={t("targets:workbench.responseMapping.title")} className="mb-0" />
              <div className="text-sm bg-zinc-100 dark:bg-zinc-900 px-3 py-1 rounded-full text-zinc-500 font-mono border border-zinc-200 dark:border-zinc-800">
                JSONPath
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">{t("targets:workbench.responseMapping.desc")}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-50/50 dark:bg-zinc-950/30 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
              <FormField
                control={form.control}
                name="responseMapping.answerPath"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("targets:workbench.responseMapping.answerPath")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("targets:workbench.responseMapping.answerPathPlaceholder")} className="font-mono text-sm bg-white dark:bg-zinc-900" {...field} value={field.value || ""} />
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
                      <Input placeholder={t("targets:workbench.responseMapping.sourcesPathPlaceholder")} className="font-mono text-sm bg-white dark:bg-zinc-900" {...field} value={field.value || ""} />
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
                      <Input placeholder={t("targets:workbench.responseMapping.latencyPathPlaceholder")} className="font-mono text-sm bg-white dark:bg-zinc-900" {...field} value={field.value || ""} />
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
                    <Select value={field.value || "FAIL"} onValueChange={field.onChange} disabled={isPending}>
                      <FormControl>
                        <SelectTrigger className="bg-white dark:bg-zinc-900">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="FAIL">{t("targets:workbench.responseMapping.fail")}</SelectItem>
                        <SelectItem value="SKIP">{t("targets:workbench.responseMapping.skip")}</SelectItem>
                        <SelectItem value="WARNING">{t("targets:workbench.responseMapping.warning")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Advanced Settings / Actions */}
          <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200 dark:border-zinc-800/80 p-8 rounded-[2rem] shadow-sm hover:shadow-md transition-all duration-300">
            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-6 uppercase tracking-wider">Advanced Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
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
                        className="bg-zinc-50/50 dark:bg-zinc-950/50"
                        {...field}
                        value={field.value || ""}
                        onChange={e => field.onChange(parseInt(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="button" variant="outline" className="w-full gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 h-10">
                <Play className="h-4 w-4" />
                {t("targets:workbench.settings.testConnection")}
              </Button>
            </div>

            {mutationError && !jsonError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20 mt-6"
              >
                {errorCode ? t(`api:${errorCode}`, { defaultValue: t("errors:unknown") }) : t("errors:unknown")}
              </motion.div>
            )}

            {jsonError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20 mt-6"
              >
                {jsonError}
              </motion.div>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
