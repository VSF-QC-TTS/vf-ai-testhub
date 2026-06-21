# Epic 2: API Client, State & i18n

**Goal:** Set up API fetching, global state, and strict translation layers to handle the backend's English-only responses.

## Tasks

### TASK 2.1: Internationalization (i18n)
- [ ] Install `react-i18next` and `i18next`.
- [ ] Create translation files for English (`en`) and Vietnamese (`vi`).
- [ ] Build a language switcher component for the Top Header.
- [ ] Implement `zod-i18n-map` to localize all form validation errors.

### TASK 2.2: API Client Configuration
- [ ] Install `axios`.
- [ ] Configure Axios instance with the base URL.
- [ ] Add request interceptors to attach `Authorization: Bearer` (JWT) and `Accept-Language` headers.
- [ ] Add response interceptors for global error handling (e.g., 401 Unauthorized redirects).

### TASK 2.3: Data Fetching Strategy
- [ ] Install `@tanstack/react-query`.
- [ ] Set up the `QueryClientProvider` at the app root.
- [ ] Define generic TypeScript types to map the Backend's `PageResponse<T>` and single resource `Response` structures.

### TASK 2.4: Global State Management
- [ ] Install `zustand`.
- [ ] Create `useAuthStore` to manage JWT and user profile data.
- [ ] Create `useProjectStore` to track the globally active Project ID across pages.

## Notes
- The backend only speaks English. All labels, API error codes, and validation messages MUST be routed through the translation function `t()` before rendering.