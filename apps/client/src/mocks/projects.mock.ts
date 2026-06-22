import { http, HttpResponse, delay } from 'msw';

const API_BASE_URL = 'http://localhost:8080/api/v1';

import { initialProjectsData } from './projects.data';
import type { ProjectRequest } from '../features/projects/projects.types';

interface MockProject {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

let projects: MockProject[] = initialProjectsData.map((project) => ({
  ...project,
  description: project.description ?? null,
}));

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
    const body = await request.json() as ProjectRequest;
    const newProject = {
      id: `p-${Math.random().toString(36).substring(7)}`,
      name: body.name,
      description: body.description ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    projects.push(newProject);
    return HttpResponse.json(newProject);
  }),

  http.put(`${API_BASE_URL}/projects/:id`, async ({ request, params }) => {
    await delay(500);
    const body = await request.json() as ProjectRequest;
    const index = projects.findIndex(p => p.id === params.id);
    if (index === -1) return HttpResponse.json({ error: "Not found" }, { status: 404 });
    projects[index] = {
      ...projects[index],
      ...body,
      description: body.description ?? projects[index].description,
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(projects[index]);
  }),

  http.patch(`${API_BASE_URL}/projects/:id/archive`, async ({ params }) => {
    await delay(500);
    projects = projects.filter(p => p.id !== params.id);
    return HttpResponse.json({ success: true });
  })
];
