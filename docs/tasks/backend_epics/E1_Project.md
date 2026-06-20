## E1: Project Module

> Dependency: E0 (Foundation)

### E1.1: Entity + DTO + Mapper

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Tạo `Project` entity với Lombok (`@Entity`, `@Data`, `@Builder`) theo Database_Design | ✅ |
| 2 | Tạo `ProjectRequest` DTO (với `@Valid` annotations) | ✅ |
| 3 | Tạo `ProjectResponse` DTO | ✅ |
| 4 | Tạo `ProjectMapper` interface (MapStruct) | ✅ |
| 5 | Tạo Flyway migration cho bảng `projects` | ✅ |

- **Commit:** `feat(project): add entity, dto, mapper and migration`
- **Scope:** M
- **Review:** ✅ | **Note:**

---

### E1.2: Repository + Service

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Tạo `ProjectRepository` (Spring Data JPA interface) | ✅ |
| 2 | Tạo `ProjectService` với CRUD: create, findById, findAll, update, archive | ✅ |
| 3 | Xử lý `ResourceNotFoundException` khi findById không tìm thấy | ✅ |
| 4 | Unit test `ProjectService` bằng Mockito (mock Repository) | ✅ |

- **Commit:** `feat(project): add repository, service and unit tests`
- **Scope:** M
- **Review:** ✅ | **Note:**

---

### E1.3: Controller + Integration Tests

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Tạo `ProjectController` (`@RestController`, `/api/projects`) | ✅ |
| 2 | Implement endpoints: POST, GET /{id}, GET (list), PUT /{id}, PATCH /{id}/archive | ✅ |
| 3 | MockMvc integration test: Tạo project → 201 Created | ✅ |
| 4 | MockMvc integration test: Get project không tồn tại → 404 | ✅ |
| 5 | MockMvc integration test: Validation lỗi (thiếu name) → 400 | ✅ |

- **Commit:** `feat(project): add controller and integration tests`
- **Scope:** M
- **Review:** ✅ | **Note:**

---

### 🚩 Checkpoint: Phase 2 (CRUD cơ bản)

| # | Kiểm tra | Status |
|---|----------|--------|
| 1 | `mvn test` — All tests pass | ✅ |
| 2 | API Project CRUD hoạt động đúng qua Postman/curl | ✅ |
| 3 | Flyway migration chạy đúng, schema được tạo | ✅ |
