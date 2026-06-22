import { http, HttpResponse, delay } from 'msw';

const API_BASE_URL = 'http://localhost:8080/api/v1';

import { initialTargetsData } from './targets.data';
import type { TargetRequest } from '../features/targets/targets.types';

type MockTarget = Record<string, unknown> & {
  publicId: string;
  projectId: string;
  name: string;
};

let targets: MockTarget[] = [...initialTargetsData];

export const targetHandlers = [
  http.get(`${API_BASE_URL}/projects/:projectId/targets`, async ({ params }) => {
    await delay(500);
    const projectTargets = targets.filter(t => t.projectId === params.projectId);
    return HttpResponse.json({
      content: projectTargets,
      totalElements: projectTargets.length,
      totalPages: 1,
      size: 20,
      number: 0
    });
  }),

  http.get(`${API_BASE_URL}/targets/:id`, async ({ params }) => {
    await delay(500);
    const t = targets.find(t => t.publicId === params.id);
    if (!t) return HttpResponse.json({ error: "Not found" }, { status: 404 });
    return HttpResponse.json(t);
  }),

  http.post(`${API_BASE_URL}/targets`, async ({ request }) => {
    await delay(500);
    const body = await request.json() as TargetRequest;
    const newTarget: MockTarget = {
      ...body,
      publicId: `t-${Math.random().toString(36).substring(7)}`,
      projectId: body.projectId,
      name: body.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    targets.push(newTarget);
    return HttpResponse.json(newTarget);
  }),

  http.put(`${API_BASE_URL}/targets/:id`, async ({ request, params }) => {
    await delay(500);
    const body = await request.json() as TargetRequest;
    const index = targets.findIndex(t => t.publicId === params.id);
    if (index === -1) return HttpResponse.json({ error: "Not found" }, { status: 404 });
    targets[index] = {
      ...targets[index],
      ...body,
      projectId: body.projectId,
      name: body.name,
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(targets[index]);
  }),

  http.delete(`${API_BASE_URL}/targets/:id`, async ({ params }) => {
    await delay(500);
    targets = targets.filter(t => t.publicId !== params.id);
    return HttpResponse.json({ success: true });
  }),

  http.post(`${API_BASE_URL}/targets/parse-curl`, async () => {
    await delay(500);
    return HttpResponse.json({
      method: "POST",
      url: "https://api.example.com/chat",
      headersTemplate: { "Content-Type": "application/json" },
      bodyTemplate: { "text": "sample" }
    });
  })
];
