import { http, HttpResponse, delay } from 'msw';

const API_BASE_URL = 'http://localhost:8080/api/v1';

export const handlers = [
  // Mock POST /auth/login
  http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
    const body = await request.json() as any;
    
    // Simulate server delay
    await delay(1000);

    if (body.email === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json({
        accessToken: "mock-access-token-123",
        tokenType: "Bearer",
        expiresInSeconds: 3600,
        user: {
          publicId: "u-12345",
          email: "test@example.com",
          displayName: "Test User",
          role: "QC_MEMBER",
          status: "ACTIVE",
          avatarUrl: null,
          lastLoginAt: new Date().toISOString()
        }
      });
    }

    return HttpResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }),

  // Mock POST /auth/refresh-token
  http.post(`${API_BASE_URL}/auth/refresh-token`, async () => {
    await delay(500);
    // When running locally, simulate failure to force login screen
    return HttpResponse.json({ error: "No refresh token" }, { status: 401 });
  }),

  // Mock POST /auth/logout
  http.post(`${API_BASE_URL}/auth/logout`, async () => {
    await delay(500);
    return HttpResponse.json({});
  })
];
