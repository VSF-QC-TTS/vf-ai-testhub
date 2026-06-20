## E3: Dataset Module

> Dependency: E1 (Project)

### E3.1: Entity + DTO + Mapper

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Tạo `Dataset` entity (FK tới Project, thêm trường `description` hoặc metadata làm context context để hỗ trợ E9 AI Generator) | ⬜ |
| 2 | Tạo `DatasetRequest`, `DatasetResponse` DTO | ⬜ |
| 3 | Tạo `DatasetMapper` (MapStruct) | ⬜ |
| 4 | Tạo Flyway migration cho bảng `datasets` | ⬜ |

- **Commit:** `feat(dataset): add entity, dto, mapper and migration`
- **Review:** ⬜ | **Note:**

---

### E3.2: Service + Controller

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Tạo interface `DatasetService` và class `DatasetServiceImpl` | ⬜ |
| 2 | Tạo `DatasetRepository` | ⬜ |
| 3 | Thêm method CRUD (liên kết ProjectId) | ⬜ |
| 4 | Thêm phương thức placeholder cho AI Generator (gọi sang service của E9) | ⬜ |
| 5 | Tạo `DatasetController` (`/api/projects/{projectId}/datasets`) | ⬜ |
| 6 | Thêm endpoint AI Generator: `POST /api/datasets/{datasetId}/generate-test-cases` (nhận requirement input text) | ⬜ |

- **Commit:** `feat(dataset): add service and controller`
- **Review:** ⬜ | **Note:**

---

### E3.3: Tests

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Unit test `DatasetServiceImpl` (Mockito) | ⬜ |
| 2 | MockMvc test: CRUD endpoints | ⬜ |
| 3 | MockMvc test: Tạo dataset cho project không tồn tại → 404 | ⬜ |

- **Commit:** `test(dataset): add unit and integration tests`
- **Review:** ⬜ | **Note:**
