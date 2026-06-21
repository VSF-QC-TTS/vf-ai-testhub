# Epic 3: Authentication & Security

**Goal:** Implement login flows against the fully implemented Spring Security (OAuth2/JWT) backend.

## Tasks

### TASK 3.1: Login Page UI
- [ ] Build the `/login` route.
- [ ] Implement UI for social login buttons ("Continue with Google", "Continue with GitHub").
- [ ] Ensure the login card is perfectly centered on desktop and responsive on mobile.

### TASK 3.2: OAuth2 Flow Integration
- [ ] Wire social login buttons to redirect to the Backend's OAuth2 authorization endpoints (`/oauth2/authorization/google`, etc.).
- [ ] Implement the OAuth2 callback handler page to extract the JWT token returned by the backend after successful social authentication.
- [ ] Save the token securely via `useAuthStore`.

### TASK 3.3: Local Credentials Flow (Optional/If Supported)
- [ ] Build Local Login and Registration forms.
- [ ] Implement form validation using React Hook Form + Zod.
- [ ] Connect forms to `/api/v1/auth/login` and `/api/v1/auth/register`.

### TASK 3.4: Route Protection
- [ ] Build a `<ProtectedRoute>` wrapper component.
- [ ] Redirect unauthenticated users to `/login`.
- [ ] Ensure expired tokens automatically clear the auth store and trigger a redirect.

## Notes
- Refer to `apps/api/CLAUDE.md` and Backend code for exact Auth paths.
- Ensure the login flow feels snappy using Framer Motion page transitions.