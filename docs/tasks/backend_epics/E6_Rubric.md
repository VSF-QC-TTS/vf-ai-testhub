## E6: Rubric Module

> Dependency: E1 (Project — Rubric thuộc Project scope)

### E6.1: Entity + DTO + Mapper

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Tạo `Rubric` entity (FK tới Project) | ⬜ |
| 2 | Tạo DTO + Mapper | ⬜ |
| 3 | Flyway migration cho bảng `rubrics` | ⬜ |

- **Commit:** `feat(rubric): add entity, dto, mapper and migration`
- **Review:** ⬜ | **Note:**

---

### E6.2: Service + Controller

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Tạo `RubricService` CRUD | ⬜ |
| 2 | Tạo `RubricController` (`/api/projects/{projectId}/rubrics`) | ⬜ |

- **Commit:** `feat(rubric): add service and controller`
- **Review:** ⬜ | **Note:**

---

### E6.3: Tests

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Unit test `RubricService` | ⬜ |
| 2 | MockMvc test: CRUD endpoints | ⬜ |

- **Commit:** `test(rubric): add unit and integration tests`
- **Review:** ⬜ | **Note:**
