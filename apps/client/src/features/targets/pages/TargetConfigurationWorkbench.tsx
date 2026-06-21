import { useState, useEffect } from "react";
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
import { useProjectStore } from "../../projects/project.store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";

export function TargetConfigurationWorkbench() {
  const { id } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const { data: target, isLoading: isLoadingTarget } = useTarget(isNew ? "" : id!);
  
  const createMutation = useCreateTarget();
  const updateMutation = useUpdateTarget(isNew ? "" : id!);
  const parseCurlMutation = useParseCurl();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const [curlInput, setCurlInput] = useState("");

  const form = useForm<TargetFormData>({
    resolver: zodResolver(getTargetSchema(t)),
    defaultValues: {
      projectId: activeProjectId || "",
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
    }
  }, [target, isNew, form]);

  const handleParseCurl = async () => {
    if (!curlInput.trim()) return;
    try {
      const parsed = await parseCurlMutation.mutateAsync(curlInput);
      if (parsed.method) form.setValue("method", parsed.method);
      if (parsed.url) form.setValue("url", parsed.url);
      if (parsed.headersTemplate) form.setValue("headersTemplate", parsed.headersTemplate);
      if (parsed.bodyTemplate) form.setValue("bodyTemplate", parsed.bodyTemplate);
      setCurlInput(""); // Clear after success
    } catch (e) {
      console.error("Failed to parse cURL", e);
    }
  };

  const onSubmit = (data: TargetFormData) => {
    if (isNew) {
      createMutation.mutate(data, {
        onSuccess: () => navigate("/targets"),
      });
    } else {
      updateMutation.mutate(data, {
        onSuccess: () => navigate("/targets"),
      });
    }
  };

  if (isLoadingTarget && !isNew) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex flex-col h-full w-full max-w-7xl mx-auto px-4 md:px-0 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mt-8 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/targets")} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{isNew ? "Create Target" : "Edit Target"}</h1>
            <p className="text-sm text-muted-foreground">{isNew ? "Set up a new API target." : target?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate("/targets")}>Cancel</Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending} className="gap-2">
            <Save className="h-4 w-4" />
            {isNew ? "Create Target" : "Save Changes"}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Configuration */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick cURL Import */}
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                  <Code className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                </div>
                <h2 className="text-lg font-medium">Quick Import (cURL)</h2>
              </div>
              <div className="flex gap-3">
                <Textarea 
                  placeholder="Paste your cURL command here to auto-fill the configuration below..."
                  value={curlInput}
                  onChange={(e) => setCurlInput(e.target.value)}
                  className="font-mono text-sm min-h-[100px]"
                />
                <Button 
                  type="button" 
                  variant="secondary" 
                  className="h-auto px-6 whitespace-nowrap"
                  onClick={handleParseCurl}
                  disabled={parseCurlMutation.isPending || !curlInput.trim()}
                >
                  {parseCurlMutation.isPending ? "Parsing..." : "Parse"}
                </Button>
              </div>
            </div>

            {/* HTTP Configuration */}
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                  <Link2 className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                </div>
                <h2 className="text-lg font-medium">HTTP Configuration</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="method"
                  render={({ field }) => (
                    <FormItem className="md:col-span-1">
                      <FormLabel>Method</FormLabel>
                      <FormControl>
                        <select 
                          className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
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
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://api.example.com/v1/chat" className="font-mono text-sm" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Tabs defaultValue="headers" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="headers">Headers</TabsTrigger>
                  <TabsTrigger value="body">Body (JSON)</TabsTrigger>
                  <TabsTrigger value="auth">Authentication</TabsTrigger>
                </TabsList>
                <TabsContent value="headers" className="p-4 bg-zinc-50 dark:bg-zinc-900/30 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  <p className="text-sm text-muted-foreground mb-4">Define custom HTTP headers. Use {'{{variable}}'} syntax for dynamic values.</p>
                  <Textarea 
                    placeholder='{\n  "Content-Type": "application/json",\n  "X-Custom-Header": "{{my_var}}"\n}' 
                    className="font-mono text-sm min-h-[150px]"
                    {...form.register("headersTemplate")}
                    value={typeof form.watch("headersTemplate") === 'object' ? JSON.stringify(form.watch("headersTemplate"), null, 2) : form.watch("headersTemplate") as any || ""}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        form.setValue("headersTemplate", parsed);
                      } catch (err) {
                        // Keep as string if invalid JSON while typing
                        form.setValue("headersTemplate", e.target.value as any);
                      }
                    }}
                  />
                </TabsContent>
                <TabsContent value="body" className="p-4 bg-zinc-50 dark:bg-zinc-900/30 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  <p className="text-sm text-muted-foreground mb-4">Define the request body payload template.</p>
                  <Textarea 
                    placeholder='{\n  "query": "{{input}}",\n  "session_id": "{{session_id}}"\n}' 
                    className="font-mono text-sm min-h-[200px]"
                    {...form.register("bodyTemplate")}
                    value={typeof form.watch("bodyTemplate") === 'object' ? JSON.stringify(form.watch("bodyTemplate"), null, 2) : form.watch("bodyTemplate") as any || ""}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        form.setValue("bodyTemplate", parsed);
                      } catch (err) {
                        form.setValue("bodyTemplate", e.target.value as any);
                      }
                    }}
                  />
                </TabsContent>
                <TabsContent value="auth" className="p-4 bg-zinc-50 dark:bg-zinc-900/30 rounded-xl border border-zinc-100 dark:border-zinc-800 flex items-center justify-center min-h-[200px] text-zinc-500">
                  <div className="text-center">
                    <KeyRound className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Authentication forms will be rendered here based on auth type.</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Response Mapping */}
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                    <Braces className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                  </div>
                  <h2 className="text-lg font-medium">Response Mapping</h2>
                </div>
                <div className="text-sm bg-zinc-100 dark:bg-zinc-900 px-3 py-1 rounded-full text-zinc-500 font-mono">
                  JSONPath
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Map fields from your API's JSON response to standard Evaluation metrics using JSONPath expressions.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-50 dark:bg-zinc-900/30 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <FormField
                  control={form.control}
                  name="responseMapping.answerPath"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Answer Path</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. data.choices[0].message.content" className="font-mono text-sm" {...field} value={field.value || ""} />
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
                      <FormLabel>Sources/Citations Path</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. data.metadata.citations" className="font-mono text-sm" {...field} value={field.value || ""} />
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
                      <FormLabel>Latency Path (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. metrics.total_time_ms" className="font-mono text-sm" {...field} value={field.value || ""} />
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
                      <FormLabel>Missing Field Behavior</FormLabel>
                      <FormControl>
                        <select 
                          className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950"
                          {...field}
                          value={field.value || "FAIL"}
                        >
                          <option value="FAIL">FAIL (Mark test as error)</option>
                          <option value="SKIP">SKIP (Ignore missing fields)</option>
                          <option value="WARNING">WARNING (Log warning)</option>
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
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                  <Settings2 className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                </div>
                <h2 className="text-lg font-medium">General settings</h2>
              </div>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Production RAG API" {...field} />
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
                    <FormLabel>Environment</FormLabel>
                    <FormControl>
                      <select 
                        className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950"
                        {...field}
                        value={field.value || "dev"}
                      >
                        <option value="dev">Development (dev)</option>
                        <option value="staging">Staging (staging)</option>
                        <option value="prod">Production (prod)</option>
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
                    <FormLabel>Timeout (ms)</FormLabel>
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
                  Test Connection
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
