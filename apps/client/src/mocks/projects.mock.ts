import { http, HttpResponse, delay } from 'msw';

const API_BASE_URL = 'http://localhost:8080/api/v1';

let projects = [
  {
    id: "p-12345",
    name: "Customer Support Bot",
    description: "Evaluations for the new GenAI support bot.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "p-67890",
    name: "Internal Knowledge Search",
    description: "RAG pipeline for internal documentation.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const projectHandlers = [
  http.get(`${API_BASE_URL}/projects`, async () => {
    await delay(500);
    return HttpResponse.json({
      content: projects,
      totalElements: projects.length,
      totalPages: 1,
      size: 20,
      number: 0
    });
  }),

  http.get(`${API_BASE_URL}/projects/:id`, async ({ params }) => {
    await delay(500);
    const p = projects.find(p => p.id === params.id);
    if (!p) return HttpResponse.json({ error: "Not found" }, { status: 404 });
    return HttpResponse.json(p);
  }),

  http.post(`${API_BASE_URL}/projects`, async ({ request }) => {
    await delay(500);
    const body = await request.json() as any;
    const newProject = {
      id: `p-${Math.random().toString(36).substring(7)}`,
      name: body.name,
      description: body.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    projects.push(newProject);
    return HttpResponse.json(newProject);
  }),

  http.put(`${API_BASE_URL}/projects/:id`, async ({ request, params }) => {
    await delay(500);
    const body = await request.json() as any;
    const index = projects.findIndex(p => p.id === params.id);
    if (index === -1) return HttpResponse.json({ error: "Not found" }, { status: 404 });
    projects[index] = { ...projects[index], ...body, updatedAt: new Date().toISOString() };
    return HttpResponse.json(projects[index]);
  }),

  http.patch(`${API_BASE_URL}/projects/:id/archive`, async ({ params }) => {
    await delay(500);
    projects = projects.filter(p => p.id !== params.id);
    return HttpResponse.json({ success: true });
  })
];
