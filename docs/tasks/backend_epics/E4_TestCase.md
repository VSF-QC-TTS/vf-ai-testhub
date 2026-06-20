## E4: TestCase Module

> Dependency: E3 (Dataset)

### E4.1: Entity + DTO + Mapper

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Tạo `TestCase` entity (FK tới Dataset) theo Database_Design | ⬜ |
| 2 | Tạo `TestCaseRequest`, `TestCaseResponse` DTO | ⬜ |
| 3 | Tạo `TestCaseMapper` (MapStruct) | ⬜ |
| 4 | Tạo Flyway migration cho bảng `test_cases` | ⬜ |

- **Commit:** `feat(testcase): add entity, dto, mapper and migration`
- **Review:** ⬜ | **Note:**

---

### E4.2: TestCaseService (CRUD)

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Tạo `TestCaseRepository` | ⬜ |
| 2 | Tạo `TestCaseService` CRUD (liên kết DatasetId) | ⬜ |
| 3 | Unit test bằng Mockito | ⬜ |

- **Commit:** `feat(testcase): add repository, service and unit tests`
- **Review:** ⬜ | **Note:**

---

### E4.3: ImportService (CSV/Excel — Strategy Pattern)

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Tạo interface `ImportStrategy` | ⬜ |
| 2 | Implement `CsvImportStrategy` (Apache Commons CSV, streaming) | ⬜ |
| 3 | Implement `ExcelImportStrategy` (Apache POI) | ⬜ |
| 4 | Tạo `ImportService` với Batch Processing (chunk 500, batch check duplicate, saveAll) theo LLD 2.1 | ⬜ |
| 5 | Unit test: Import 5 dòng CSV không trùng → 5 records saved | ⬜ |
| 6 | Unit test: Import 5 dòng CSV có 2 trùng → 3 records saved | ⬜ |
| 7 | Unit test: File rỗng → trả về 0 records, không throw | ⬜ |
| 8 | Unit test: File sai format (thiếu cột) → throw BusinessException | ⬜ |

- **Commit:** `feat(testcase): add import service with strategy pattern and batch processing`
- **Review:** ⬜ | **Note:**

---

### E4.4: Controller + Integration Tests

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Tạo `TestCaseController` (`/api/datasets/{datasetId}/testcases`) | ⬜ |
| 2 | Endpoint: `POST /import` nhận multipart file (CSV/Excel) | ⬜ |
| 3 | MockMvc test: CRUD endpoints | ⬜ |
| 4 | MockMvc test: Import file CSV → 200 + count imported | ⬜ |

- **Commit:** `feat(testcase): add controller with import endpoint and integration tests`
- **Review:** ⬜ | **Note:**
