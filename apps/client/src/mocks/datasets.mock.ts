import { http, HttpResponse } from "msw";
import { datasets } from "./datasets.data";
import { v4 as uuidv4 } from "uuid";
import type { DatasetCreateRequest, DatasetUpdateRequest } from "../features/datasets/datasets.types";

const PROJECT_DATASETS_URL = "/api/v1/projects/:projectId/datasets";
const DATASET_URL = "/api/v1/datasets/:id";

export const datasetHandlers = [
  http.get(PROJECT_DATASETS_URL, ({ params }) => {
    const { projectId } = params;
    const projectDatasets = datasets.filter(d => d.projectId === projectId);

    return HttpResponse.json({
      content: projectDatasets,
      totalElements: projectDatasets.length,
      totalPages: 1,
      size: 20,
      number: 0,
    });
  }),

  http.get(DATASET_URL, ({ params }) => {
    const dataset = datasets.find(d => d.publicId === params.id);

    if (!dataset) {
      return HttpResponse.json({ message: "Dataset not found" }, { status: 404 });
    }

    return HttpResponse.json(dataset);
  }),

  http.post(PROJECT_DATASETS_URL, async ({ request, params }) => {
    const { projectId } = params;
    const body = await request.json() as DatasetCreateRequest;

    const newDataset = {
      publicId: uuidv4(),
      projectId: projectId as string,
      name: body.name,
      description: body.description ?? "",
      category: body.category ?? "",
      tags: body.tags || [],
      testCaseCount: 0,
      creator: "Test User",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    datasets.unshift(newDataset);

    return HttpResponse.json(newDataset, { status: 201 });
  }),

  http.put(DATASET_URL, async ({ request, params }) => {
    const { id } = params;
    const body = await request.json() as DatasetUpdateRequest;

    const index = datasets.findIndex(d => d.publicId === id);
    if (index === -1) {
      return HttpResponse.json({ message: "Dataset not found" }, { status: 404 });
    }

    const updated = {
      ...datasets[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    datasets[index] = updated;

    return HttpResponse.json(updated);
  }),

  http.delete(DATASET_URL, ({ params }) => {
    const { id } = params;
    const index = datasets.findIndex(d => d.publicId === id);

    if (index !== -1) {
      datasets.splice(index, 1);
    }

    return new HttpResponse(null, { status: 204 });
  })
];
