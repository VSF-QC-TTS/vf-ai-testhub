## E8: Result & ManualReview Module

> Dependency: E7 (Run phải tồn tại), E4 (TestCase)

### E8.1: Result Entities

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Tạo `TestResult` entity (FK tới Run + TestCase) | ⬜ |
| 2 | Tạo `AssertionResult` entity (FK tới TestResult) | ⬜ |
| 3 | Tạo `ToolExpectationResult` entity (FK tới TestResult) | ⬜ |
| 4 | Tạo DTO + Mapper cho cả 3 | ⬜ |
| 5 | Flyway migration cho 3 bảng | ⬜ |

- **Commit:** `feat(result): add result entities, dto, mapper and migrations`
- **Review:** ⬜ | **Note:**

---

### E8.2: Result ingestion API

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Tạo `ResultIngestionController` — endpoint nội bộ `POST /internal/runs/{runId}/results` | ⬜ |
| 2 | Nhận batch `TestResult[]` từ Runner, batch insert vào DB | ⬜ |
| 3 | Khi nhận batch cuối cùng → update `Run.status = COMPLETED` | ⬜ |
| 4 | Unit test: Nhận batch 50 results → verify saveAll gọi đúng | ⬜ |

- **Commit:** `feat(result): add result ingestion api for runner callback`
- **Review:** ⬜ | **Note:**

---

### E8.3: ManualReview Entity + Service

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Tạo `ManualReview` entity (FK tới TestResult) — status override, notes, reviewedBy | ⬜ |
| 2 | Tạo `ManualReviewService` — QC có thể override PASS/FAIL/UNCERTAIN | ⬜ |
| 3 | Flyway migration | ⬜ |
| 4 | Unit test | ⬜ |

- **Commit:** `feat(result): add manual review entity and service`
- **Review:** ⬜ | **Note:**

---

### E8.4: Report aggregation Service

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Tạo `ReportService` — tổng hợp: total, passed, failed, uncertain, pass rate | ⬜ |
| 2 | Trả về danh sách TestResult kèm AssertionResult[] và ToolExpectationResult[] | ⬜ |
| 3 | Unit test: Tính toán pass rate đúng | ⬜ |

- **Commit:** `feat(result): add report aggregation service`
- **Review:** ⬜ | **Note:**

---

### E8.5: Controller + Tests

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Tạo `ResultController` (`/api/runs/{runId}/results`) và endpoint Compare (`/api/runs/compare`) | ⬜ |
| 2 | Tạo `ManualReviewController` (`/api/results/{resultId}/review`) | ⬜ |
| 3 | MockMvc test: Get report → 200 + đúng cấu trúc JSON | ⬜ |
| 4 | MockMvc test: Get compare → 200 | ⬜ |
| 5 | MockMvc test: Submit manual review → 200 | ⬜ |

- **Commit:** `feat(result): add controllers and integration tests`
- **Review:** ⬜ | **Note:**
