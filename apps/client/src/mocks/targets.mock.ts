import { http, HttpResponse, delay } from 'msw';

const API_BASE_URL = 'http://localhost:8080/api/v1';

let targets = [
  {
    publicId: "t-123",
    projectId: "p-12345",
    name: "Production RAG API",
    environment: "prod",
    targetType: "HTTP",
    method: "POST",
    url: "https://api.example.com/v1/chat",
    isDefault: true,
    timeoutMs: 30000,
    headersTemplate: { "Authorization": "Bearer {{api_key}}" },
    bodyTemplate: { "query": "{{input}}" },
    responseMapping: {
      answerPath: "choices[0].message.content",
      latencyPath: "usage.total_tokens"
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

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
    const body = await request.json() as any;
    const newTarget = {
      ...body,
      publicId: `t-${Math.random().toString(36).substring(7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    targets.push(newTarget);
    return HttpResponse.json(newTarget);
  }),

  http.put(`${API_BASE_URL}/targets/:id`, async ({ request, params }) => {
    await delay(500);
    const body = await request.json() as any;
    const index = targets.findIndex(t => t.publicId === params.id);
    if (index === -1) return HttpResponse.json({ error: "Not found" }, { status: 404 });
    targets[index] = { ...targets[index], ...body, updatedAt: new Date().toISOString() };
    return HttpResponse.json(targets[index]);
  }),

  http.delete(`${API_BASE_URL}/targets/:id`, async ({ params }) => {
    await delay(500);
    targets = targets.filter(t => t.publicId !== params.id);
    return HttpResponse.json({ success: true });
  }),

  http.post(`${API_BASE_URL}/targets/parse-curl`, async ({ request }) => {
    await delay(500);
    return HttpResponse.json({
      method: "POST",
      url: "https://api.example.com/chat",
      headersTemplate: { "Content-Type": "application/json" },
      bodyTemplate: { "text": "sample" }
    });
  })
];
