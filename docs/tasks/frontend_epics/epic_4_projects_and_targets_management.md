# Epic 4: Projects & Targets Management

**Goal:** Build the UI to consume the fully implemented `/api/v1/projects` and `/api/v1/targets` backend endpoints.

## Tasks

### TASK 4.1: Project List View
- [ ] Build the `/projects` route.
- [ ] Fetch and display paginated projects using TanStack Query.
- [ ] Implement the Empty State pattern (icon + CTA) if no projects exist.
- [ ] Render data in a high-density Table or responsive Card grid.

### TASK 4.2: Project Form
- [ ] Build a Modal/Dialog for Creating and Editing a Project.
- [ ] Implement validation using Zod.
- [ ] Handle backend submission errors gracefully (Toast notifications).

### TASK 4.3: Target List View
- [ ] Build the UI to list Targets belonging to the active Project.
- [ ] Implement context switching (allowing the user to select which Target is currently "Active" for test runs).

### TASK 4.4: Target Configuration Form
- [ ] Build the form to Create/Edit a Target.
- [ ] Inputs must include: HTTP Method dropdown, URL string, Timeout number.
- [ ] Implement JSON editor inputs for `headers` and `bodyTemplate`. Ensure monospaced typography is used for these fields.

### TASK 4.5: Response Mapping (Advanced)
- [ ] Build the UI to manage `ResponseMapping` for a Target (`GET/PUT /api/v1/targets/{targetId}/response-mapping`).
- [ ] Implement inputs to define JSONPaths for fields like `answerPath`, `intentPath`, etc.

## Notes
- Read `apps/api/src/main/java/vn/vinfast/aitesthub/project/request` and `response` directories to ensure form fields perfectly match backend DTOs.