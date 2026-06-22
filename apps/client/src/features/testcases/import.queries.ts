import { useMutation, useQueryClient } from "@tanstack/react-query";
import { previewImport, confirmImport } from "./import.api";
import { testCaseKeys } from "./testcases.api";
import { datasetKeys } from "../datasets/datasets.api";
import type { ConfirmTestCaseImportRequest } from "./import.types";

export const usePreviewImport = (datasetId: string) => {
  return useMutation({
    mutationFn: (file: File) => previewImport(datasetId, file),
  });
};

export const useConfirmImport = (datasetId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: ConfirmTestCaseImportRequest) => confirmImport(datasetId, request),
    onSuccess: () => {
      // Invalidate test cases and datasets as testCaseCount will change
      queryClient.invalidateQueries({ queryKey: testCaseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: datasetKeys.lists() });
    },
  });
};
