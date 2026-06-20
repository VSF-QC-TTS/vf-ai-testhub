## E3: Dataset Module

> Dependency: E1 (Project)

### E3.1: Entity + DTO + Mapper

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Tạo `Dataset` entity (FK tới Project) theo Database_Design | ⬜ |
| 2 | Tạo `DatasetRequest`, `DatasetResponse` DTO | ⬜ |
| 3 | Tạo `DatasetMapper` (MapStruct) | ⬜ |
| 4 | Tạo Flyway migration cho bảng `datasets` | ⬜ |

- **Commit:** `feat(dataset): add entity, dto, mapper and migration`
- **Review:** ⬜ | **Note:**

---

### E3.2: Service + Controller

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Tạo `DatasetRepository` | ⬜ |
| 2 | Tạo `DatasetService` CRUD (liên kết ProjectId) | ⬜ |
| 3 | Tạo `DatasetController` (`/api/projects/{projectId}/datasets`) | ⬜ |

- **Commit:** `feat(dataset): add service and controller`
- **Review:** ⬜ | **Note:**

---

### E3.3: Tests

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Unit test `DatasetService` (Mockito) | ⬜ |
| 2 | MockMvc test: CRUD endpoints | ⬜ |
| 3 | MockMvc test: Tạo dataset cho project không tồn tại → 404 | ⬜ |

- **Commit:** `test(dataset): add unit and integration tests`
- **Review:** ⬜ | **Note:**
