## E4: TestCase Module

> Dependency: E3 (Dataset)

### E4.1: Entity + DTO + Mapper

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Tạo `TestCase` entity (FK tới Dataset) | ⬜ |
| 2 | Thêm các trường dữ liệu theo UI Spec: `inputMessage` (text), `expectedIntent` (varchar), mảng `tags` (Text Array/JSONB lưu "Happy Path", "Edge Case") | ⬜ |
| 3 | Tạo `TestCaseRequest`, `TestCaseResponse` DTO (cập nhật mapping cho tags) | ⬜ |
| 4 | Tạo `TestCaseMapper` (MapStruct) | ⬜ |
| 5 | Tạo Flyway migration cho bảng `test_cases` (hỗ trợ các cột JSONB/Array) | ⬜ |

- **Commit:** `feat(testcase): add entity, dto, mapper and migration`
- **Review:** ⬜ | **Note:**

---

### E4.2: TestCaseService (CRUD & Filtering)

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Tạo interface `TestCaseService` và class `TestCaseServiceImpl` | ⬜ |
| 2 | Tạo `TestCaseRepository` (implement `JpaSpecificationExecutor` để hỗ trợ dynamic filtering) | ⬜ |
| 3 | Thêm method CRUD cơ bản (liên kết DatasetId) | ⬜ |
| 4 | Thêm method search/filter (hỗ trợ phân trang, lọc theo array `tags`, search `keyword` trên `inputMessage`) | ⬜ |
| 5 | Unit test bằng Mockito cho CRUD và Filter logic | ⬜ |

- **Commit:** `feat(testcase): add repository, service with filtering and unit tests`
- **Review:** ⬜ | **Note:**

---

### E4.3: ImportService (CSV/Excel — Strategy Pattern)

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Tạo interface `ImportStrategy` | ⬜ |
| 2 | Implement `CsvImportStrategy` (hỗ trợ parse map cột mới như `tags`, `expectedIntent`) | ⬜ |
| 3 | Implement `ExcelImportStrategy` (Apache POI) | ⬜ |
| 4 | Tạo `ImportService` với Batch Processing (chunk 500, batch check duplicate, saveAll) theo LLD 2.1 | ⬜ |
| 5 | Unit test: Import tags hợp lệ và lưu thành công | ⬜ |
| 6 | Unit test: Import CSV có dòng trùng lặp → bỏ qua | ⬜ |
| 7 | Unit test: File rỗng → trả về 0 records, không throw | ⬜ |
| 8 | Unit test: File sai format (thiếu cột) → throw BusinessException | ⬜ |

- **Commit:** `feat(testcase): add import service supporting tags and batch processing`
- **Review:** ⬜ | **Note:**

---

### E4.4: Controller + Integration Tests

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Tạo `TestCaseController` (`/api/datasets/{datasetId}/testcases`) | ⬜ |
| 2 | Endpoint: `GET /` với Pagination và Request Params cho Filter (`?tags=Happy Path,Edge Case&keyword=...`) | ⬜ |
| 3 | Endpoint: `POST /import` nhận multipart file (CSV/Excel) | ⬜ |
| 4 | MockMvc test: GET endpoint với các query parameters filtering | ⬜ |
| 5 | MockMvc test: Import file CSV → 200 + count imported | ⬜ |

- **Commit:** `feat(testcase): add controller with filter, import endpoint and tests`
- **Review:** ⬜ | **Note:**
