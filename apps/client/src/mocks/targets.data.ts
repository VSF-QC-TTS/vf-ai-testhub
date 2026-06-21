export const initialTargetsData = [
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
