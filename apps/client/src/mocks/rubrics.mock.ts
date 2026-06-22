import { http, HttpResponse } from "msw";
import type { RubricSnapshotDto, CreateRubricDto } from "../features/rubrics/rubrics.schemas";
import { RubricScope, RubricCategory } from "../features/rubrics/rubrics.schemas";

const MOCK_RUBRICS: RubricSnapshotDto[] = [
  {
    publicId: "rubric-1",
    name: "Vietnamese Tone Analysis",
    description: "Evaluates if the response maintains a polite, natural Vietnamese tone.",
    category: RubricCategory.VIETNAMESE_TONE,
    scope: RubricScope.GLOBAL,
    language: "vi",
    content: "The response must use standard Vietnamese grammar and vocabulary. Tone should be professional yet helpful.",
    defaultThreshold: 0.85,
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    publicId: "rubric-2",
    name: "General Hallucination Check",
    description: "Checks if the model hallucinates information not provided in the context.",
    category: RubricCategory.NO_HALLUCINATION,
    scope: RubricScope.PROJECT,
    projectPublicId: "project-1",
    language: "en",
    content: "Verify that all facts mentioned in the answer exist in the provided reference context.",
    defaultThreshold: 0.9,
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const rubricsHandlers = [
  http.get("*/api/v1/projects/:projectId/rubrics", ({ request }) => {
    const url = new URL(request.url);
    const archived = url.searchParams.get("archived") === "true";
    
    let items = MOCK_RUBRICS.filter(r => r.scope === RubricScope.PROJECT);
    if (!archived) {
      items = items.filter(r => !r.archived);
    }
    
    return HttpResponse.json({
      content: items,
      pageable: { pageNumber: 0, pageSize: 20 },
      totalElements: items.length,
      totalPages: 1,
      last: true,
    });
  }),

  http.get("*/api/v1/rubrics/global", ({ request }) => {
    const url = new URL(request.url);
    const archived = url.searchParams.get("archived") === "true";
    
    let items = MOCK_RUBRICS.filter(r => r.scope === RubricScope.GLOBAL);
    if (!archived) {
      items = items.filter(r => !r.archived);
    }

    return HttpResponse.json({
      content: items,
      pageable: { pageNumber: 0, pageSize: 20 },
      totalElements: items.length,
      totalPages: 1,
      last: true,
    });
  }),

  http.post("*/api/v1/projects/:projectId/rubrics", async ({ request, params }) => {
    const body = await request.json() as CreateRubricDto;
    const newRubric: RubricSnapshotDto = {
      publicId: `rubric-new-${Date.now()}`,
      name: body.name,
      description: body.description,
      category: body.category as RubricCategory,
      scope: body.scope as RubricScope || RubricScope.PROJECT,
      projectPublicId: params.projectId as string,
      language: body.language,
      content: body.content,
      defaultThreshold: body.defaultThreshold ?? 0.8,
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    MOCK_RUBRICS.push(newRubric);
    return HttpResponse.json(newRubric, { status: 201 });
  }),

  http.put("*/api/v1/rubrics/:rubricId", async ({ request, params }) => {
    const body = await request.json() as Partial<CreateRubricDto>;
    const idx = MOCK_RUBRICS.findIndex(r => r.publicId === params.rubricId);
    if (idx !== -1) {
      MOCK_RUBRICS[idx] = { ...MOCK_RUBRICS[idx], ...body, updatedAt: new Date().toISOString() };
      return HttpResponse.json(MOCK_RUBRICS[idx]);
    }
    return HttpResponse.json({ error: "Not Found" }, { status: 404 });
  }),

  http.delete("*/api/v1/rubrics/:rubricId", ({ params }) => {
    const idx = MOCK_RUBRICS.findIndex(r => r.publicId === params.rubricId);
    if (idx !== -1) {
      MOCK_RUBRICS[idx].archived = true;
      return new HttpResponse(null, { status: 204 });
    }
    return HttpResponse.json({ error: "Not Found" }, { status: 404 });
  }),
];
