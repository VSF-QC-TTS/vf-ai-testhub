import { http, HttpResponse } from "msw";
import { datasets } from "./datasets.data";
import { v4 as uuidv4 } from "uuid";
import type { DatasetCreateRequest, DatasetUpdateRequest } from "../features/datasets/datasets.types";

const BASE_URL = "/api/v1/projects/:projectId/datasets";

export const datasetHandlers = [
  http.get(BASE_URL, ({ params }) => {
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

  http.get(`${BASE_URL}/:id`, ({ params }) => {
    const dataset = datasets.find(d => d.publicId === params.id && d.projectId === params.projectId);

    if (!dataset) {
      return HttpResponse.json({ message: "Dataset not found" }, { status: 404 });
    }

    return HttpResponse.json(dataset);
  }),

  http.post(BASE_URL, async ({ request, params }) => {
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

  http.put(`${BASE_URL}/:id`, async ({ request, params }) => {
    const { id, projectId } = params;
    const body = await request.json() as DatasetUpdateRequest;

    const index = datasets.findIndex(d => d.publicId === id && d.projectId === projectId);
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

  http.delete(`${BASE_URL}/:id`, ({ params }) => {
    const { id, projectId } = params;
    const index = datasets.findIndex(d => d.publicId === id && d.projectId === projectId);

    if (index !== -1) {
      datasets.splice(index, 1);
    }

    return new HttpResponse(null, { status: 204 });
  })
];
