import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { CheckCircle2, AlertCircle, FileSpreadsheet, X } from "lucide-react";
import { usePreviewImport, useConfirmImport } from "../import.queries";
import type { ImportPreviewResponse, ImportConfirmResponse } from "../import.types";
import { motion, AnimatePresence } from "framer-motion";
import { ApiError } from "@/lib/api/errors";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";

interface TestCaseImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SUPPORTED_FIELDS = [
  { value: "", label: "-- Ignore --" },
  { value: "externalId", label: "External ID" },
  { value: "sectionName", label: "Section" },
  { value: "name", label: "Name" },
  { value: "input", label: "Input *" },
  { value: "expectedBehavior", label: "Expected Behavior" },
  { value: "referenceAnswer", label: "Reference Answer" },
  { value: "preconditions", label: "Preconditions" },
  { value: "tags", label: "Tags (comma-separated)" },
  { value: "priority", label: "Priority (P0-P3)" }
];
const IGNORE_FIELD_VALUE = "__ignore__";

export function TestCaseImportDialog({ open, onOpenChange }: TestCaseImportDialogProps) {
  const { t } = useTranslation();
  const { datasetId = "" } = useParams();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  
  const [step, setStep] = useState<"UPLOAD" | "PREVIEW" | "RESULT">("UPLOAD");
  const [previewData, setPreviewData] = useState<ImportPreviewResponse | null>(null);
  const [resultData, setResultData] = useState<ImportConfirmResponse | null>(null);
  
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [defaultTags, setDefaultTags] = useState("");

  const previewMutation = usePreviewImport(datasetId);
  const confirmMutation = useConfirmImport(datasetId);

  const resetState = () => {
    setFile(null);
    setStep("UPLOAD");
    setPreviewData(null);
    setResultData(null);
    setColumnMapping({});
    setSkipDuplicates(true);
    setDefaultTags("");
    previewMutation.reset();
    confirmMutation.reset();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetState();
    }
    onOpenChange(newOpen);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    previewMutation.mutate(file, {
      onSuccess: (data) => {
        setPreviewData(data);
        setColumnMapping(data.suggestedMapping || {});
        setStep("PREVIEW");
      },
      onError: (err) => {
        const errorCode = err instanceof ApiError ? err.code : undefined;
        toast.error(errorCode ? t(`api:${errorCode}`) : t("testcases:import.previewFailed"));
      }
    });
  };

  const handleConfirm = () => {
    if (!previewData) return;
    
    // Check if required 'input' field is mapped
    const hasInput = Object.values(columnMapping).includes("input");
    if (!hasInput) {
      toast.error(t("testcases:import.inputRequired"));
      return;
    }

    const payload = {
      previewId: previewData.previewId,
      columnMapping,
      skipDuplicates,
      defaultTags: defaultTags ? defaultTags.split(",").map(tag => tag.trim()).filter(Boolean) : []
    };

    confirmMutation.mutate(payload, {
      onSuccess: (data) => {
        setResultData(data);
        setStep("RESULT");
        toast.success(t("testcases:import.success"));
      },
      onError: (err) => {
        const errorCode = err instanceof ApiError ? err.code : undefined;
        toast.error(errorCode ? t(`api:${errorCode}`) : t("testcases:import.confirmFailed"));
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>{t("testcases:import.title")}</DialogTitle>
          <DialogDescription>
            {step === "UPLOAD" && t("testcases:import.uploadDesc")}
            {step === "PREVIEW" && t("testcases:import.previewDesc")}
            {step === "RESULT" && t("testcases:import.resultDesc")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 pt-4">
          <AnimatePresence mode="wait">
            {step === "UPLOAD" && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div 
                  className="border-2 border-dashed rounded-lg border-zinc-200 dark:border-zinc-800 p-10 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".csv,.xls,.xlsx"
                    onChange={handleFileSelect}
                  />
                  <div className="h-16 w-16 bg-white dark:bg-zinc-950 rounded-full flex items-center justify-center shadow-sm mb-4">
                    <FileSpreadsheet className="h-8 w-8 text-indigo-500" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">{t("testcases:import.clickToSelect")}</h3>
                  <p className="text-zinc-500 text-sm mb-4 text-center max-w-sm">
                    {t("testcases:import.supportedFiles")}
                  </p>
                  <Button type="button" variant="secondary" className="pointer-events-none">
                    {file ? file.name : t("testcases:import.selectFile")}
                  </Button>
                </div>
                
                {file && (
                  <div className="flex items-center justify-between p-4 border rounded-md bg-white dark:bg-zinc-950">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="h-5 w-5 text-indigo-500" />
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </motion.div>
            )}

            {step === "PREVIEW" && previewData && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-md bg-zinc-50 dark:bg-zinc-900">
                    <p className="text-xs text-muted-foreground mb-1">{t("testcases:import.totalRows")}</p>
                    <p className="text-2xl font-semibold">{previewData.totalRows}</p>
                  </div>
                  <div className="p-4 border rounded-md bg-zinc-50 dark:bg-zinc-900">
                    <p className="text-xs text-muted-foreground mb-1">{t("testcases:import.columnsDetected")}</p>
                    <p className="text-2xl font-semibold">{previewData.detectedColumns.length}</p>
                  </div>
                  <div className="p-4 border rounded-md bg-zinc-50 dark:bg-zinc-900">
                    <p className="text-xs text-muted-foreground mb-1">{t("testcases:import.mappedFields")}</p>
                    <p className="text-2xl font-semibold text-indigo-600">{Object.values(columnMapping).filter(Boolean).length}</p>
                  </div>
                  <div className="p-4 border rounded-md bg-zinc-50 dark:bg-zinc-900">
                    <p className="text-xs text-muted-foreground mb-1">{t("testcases:import.duplicates")}</p>
                    <p className="text-2xl font-semibold text-orange-600">{previewData.duplicateCount}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-sm">{t("testcases:import.columnMapping")}</h3>
                  <div className="border rounded-md overflow-hidden bg-white dark:bg-zinc-950">
                    <Table>
                      <TableHeader className="bg-zinc-50 dark:bg-zinc-900">
                        <TableRow>
                          <TableHead className="w-1/2">{t("testcases:import.fileColumn")}</TableHead>
                          <TableHead className="w-1/2">{t("testcases:import.mapToField")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewData.detectedColumns.map(col => (
                          <TableRow key={col}>
                            <TableCell className="font-mono text-sm">{col}</TableCell>
                            <TableCell>
                              <Select
                                value={columnMapping[col] || IGNORE_FIELD_VALUE}
                                onValueChange={(value) =>
                                  setColumnMapping(prev => ({
                                    ...prev,
                                    [col]: value === IGNORE_FIELD_VALUE ? "" : value,
                                  }))
                                }
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {SUPPORTED_FIELDS.map(f => (
                                    <SelectItem key={f.value || IGNORE_FIELD_VALUE} value={f.value || IGNORE_FIELD_VALUE}>
                                      {f.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {previewData.sampleRows && previewData.sampleRows.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-sm">{t("testcases:import.dataPreview")}</h3>
                    <div className="border rounded-md overflow-x-auto bg-white dark:bg-zinc-950">
                      <Table>
                        <TableHeader className="bg-zinc-50 dark:bg-zinc-900">
                          <TableRow>
                            {previewData.detectedColumns.map(col => (
                              <TableHead key={col} className="whitespace-nowrap min-w-[150px]">
                                {col}
                                {columnMapping[col] && (
                                  <span className="block text-[10px] text-indigo-500 font-semibold uppercase">
                                    → {columnMapping[col]}
                                  </span>
                                )}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {previewData.sampleRows.map(row => (
                            <TableRow key={row.row}>
                              {previewData.detectedColumns.map(col => (
                                <TableCell key={col} className="truncate max-w-[200px]" title={String(row.data[col] || "")}>
                                  {String(row.data[col] || "")}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("testcases:import.defaultTags")}</label>
                    <Input 
                      placeholder="e.g. imported, q2_data" 
                      value={defaultTags}
                      onChange={(e) => setDefaultTags(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-8">
                    <input
                      type="checkbox"
                      id="skipDuplicates"
                      checked={skipDuplicates}
                      onChange={(e) => setSkipDuplicates(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                    <label htmlFor="skipDuplicates" className="text-sm font-medium cursor-pointer">
                      {t("testcases:import.skipDuplicates")}
                    </label>
                  </div>
                </div>

              </motion.div>
            )}

            {step === "RESULT" && resultData && (
              <motion.div
                key="result"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex flex-col items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-900 rounded-lg border">
                  {resultData.errorCount === 0 ? (
                    <div className="h-16 w-16 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-500 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                  ) : (
                    <div className="h-16 w-16 bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-500 rounded-full flex items-center justify-center mb-4">
                      <AlertCircle className="h-8 w-8" />
                    </div>
                  )}
                  <h3 className="text-xl font-medium mb-2">
                    {resultData.errorCount === 0 ? t("testcases:import.importComplete") : t("testcases:import.importCompleteWithErrors")}
                  </h3>
                  <div className="flex gap-4 text-sm mt-4">
                    <div className="px-3 py-1 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400 rounded-md border border-green-200 dark:border-green-900">
                      <span className="font-semibold">{resultData.importedCount}</span> {t("testcases:import.imported")}
                    </div>
                    {resultData.skippedCount > 0 && (
                      <div className="px-3 py-1 bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 rounded-md border border-zinc-200 dark:border-zinc-700">
                        <span className="font-semibold">{resultData.skippedCount}</span> {t("testcases:import.skipped")}
                      </div>
                    )}
                    {resultData.errorCount > 0 && (
                      <div className="px-3 py-1 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400 rounded-md border border-red-200 dark:border-red-900">
                        <span className="font-semibold">{resultData.errorCount}</span> {t("testcases:import.errors")}
                      </div>
                    )}
                  </div>
                </div>

                {resultData.errors && resultData.errors.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-sm text-red-600 dark:text-red-400">{t("testcases:import.errorDetails")}</h3>
                    <div className="border rounded-md overflow-hidden bg-white dark:bg-zinc-950">
                      <Table>
                        <TableHeader className="bg-zinc-50 dark:bg-zinc-900">
                          <TableRow>
                            <TableHead className="w-[100px]">{t("testcases:import.row")}</TableHead>
                            <TableHead>{t("testcases:import.reason")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {resultData.errors.map((err, i) => (
                            <TableRow key={i}>
                              <TableCell className="font-mono text-sm">#{err.row}</TableCell>
                              <TableCell className="text-red-600 dark:text-red-400">{err.reason}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DialogFooter className="p-6 pt-4 border-t bg-zinc-50/50 dark:bg-zinc-900/20">
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={previewMutation.isPending || confirmMutation.isPending}>
            {step === "RESULT" ? t("common:actions.close") : t("common:actions.cancel")}
          </Button>
          
          {step === "UPLOAD" && (
            <Button onClick={handleUpload} disabled={!file || previewMutation.isPending}>
              {previewMutation.isPending ? t("testcases:import.uploading") : t("testcases:import.preview")}
            </Button>
          )}

          {step === "PREVIEW" && (
            <Button onClick={handleConfirm} disabled={confirmMutation.isPending}>
              {confirmMutation.isPending ? t("testcases:import.importing") : t("testcases:import.confirmImport")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
