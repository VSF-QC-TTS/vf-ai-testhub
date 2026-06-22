import { http, HttpResponse, delay } from 'msw';
import { initialAuthData } from './auth.data';
import type {
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from '../features/auth/auth.types';

const API_BASE_URL = 'http://localhost:8080/api/v1';

export const authHandlers = [
  // Mock POST /auth/login
  http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
    const body = await request.json() as LoginRequest;
    
    // Simulate server delay
    await delay(1000);

    if (body.email === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json(initialAuthData);
    }

    return HttpResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }),

  http.post(`${API_BASE_URL}/auth/register`, async ({ request }) => {
    const body = await request.json() as RegisterRequest;
    await delay(600);

    return HttpResponse.json({
      ...initialAuthData.user,
      publicId: `u-${crypto.randomUUID()}`,
      email: body.email,
      displayName: body.displayName || body.email.split("@")[0],
      status: "PENDING_EMAIL_VERIFICATION",
      lastLoginAt: null,
    }, { status: 201 });
  }),

  http.post(`${API_BASE_URL}/auth/verify-email`, async ({ request }) => {
    const body = await request.json() as VerifyEmailRequest;
    await delay(600);

    if (!body.token) {
      return HttpResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    return HttpResponse.json({
      ...initialAuthData.user,
      status: "ACTIVE",
    });
  }),

  http.post(`${API_BASE_URL}/auth/forgot-password`, async ({ request }) => {
    await request.json() as ForgotPasswordRequest;
    await delay(600);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${API_BASE_URL}/auth/reset-password`, async ({ request }) => {
    const body = await request.json() as ResetPasswordRequest;
    await delay(600);

    if (!body.token) {
      return HttpResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    return new HttpResponse(null, { status: 204 });
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
