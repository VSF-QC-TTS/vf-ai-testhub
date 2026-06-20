## E7: Run Module (Complex — Facade Pattern)

> Dependency: E2 (Target), E4 (TestCase), E5 (Assertion), E6 (Rubric), E0.4 (Redis)
>
> ⚠️ Đây là Epic phức tạp nhất. Tham chiếu LLD mục 2.2 (Batch Fetching 5 SQL).

### E7.1: Run Entity + DTO

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Tạo `Run` entity (FK tới Dataset + Target) — status, startedAt, completedAt... | ⬜ |
| 2 | Tạo `RunRequest`, `RunResponse`, `RunSnapshotDto` | ⬜ |
| 3 | Flyway migration cho bảng `runs` | ⬜ |

- **Commit:** `feat(run): add run entity, dto and migration`
- **Review:** ⬜ | **Note:**

---

### E7.2: RunSnapshot assembly (Batch Fetching)

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Implement logic lấy dữ liệu bằng chính xác 5 câu SQL (theo LLD 2.2) | ⬜ |
| 2 | Dùng `Collectors.groupingBy` gắn Assertion/ToolExpectation vào đúng TestCase | ⬜ |
| 3 | Serialize thành `RunSnapshotDto` JSON | ⬜ |
| 4 | Unit test: Mock 5 repositories, verify output RunSnapshotDto chứa đúng số lượng TestCase và mỗi TestCase có đúng Assertions gắn vào (test state/output, không test số lần gọi) | ⬜ |
| 5 | Unit test: Dataset rỗng (0 testcase) → trả về snapshot rỗng, không crash | ⬜ |

- **Commit:** `feat(run): implement run snapshot assembly with batch fetching`
- **Scope:** L
- **Review:** ⬜ | **Note:**

---

### E7.3: Redis Streams publisher (XADD)

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Tạo `RunStreamPublisher` sử dụng `StreamOperations.add()` | ⬜ |
| 2 | Serialize RunSnapshot → JSON string → XADD vào stream key `run:jobs` | ⬜ |
| 3 | Integration test: Publish message → verify message tồn tại trong Redis stream | ⬜ |

- **Commit:** `feat(run): add redis streams publisher`
- **Review:** ⬜ | **Note:**

---

### E7.4: RunService (Facade)

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Tạo `RunService.triggerRun(datasetId, targetId)` — Facade che giấu logic bên dưới | ⬜ |
| 2 | Logic: Tạo Run record (status=PENDING) → Assembly snapshot → Publish to Redis → Update status=RUNNING | ⬜ |
| 3 | Xử lý edge case: Target không tồn tại, Dataset rỗng → throw BusinessException | ⬜ |
| 4 | Unit test: Mock dependencies, verify Run.status chuyển từ PENDING → RUNNING và RunSnapshot được publish (test state, không test thứ tự gọi) | ⬜ |

- **Commit:** `feat(run): add run service facade`
- **Review:** ⬜ | **Note:**

---

### E7.5: Controller + Integration Tests

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Tạo `RunController` (`/api/datasets/{datasetId}/runs`) | ⬜ |
| 2 | Endpoint: `POST /trigger` kích hoạt run | ⬜ |
| 3 | Endpoint: `GET /{runId}` xem status | ⬜ |
| 4 | Endpoint: `GET /` liệt kê run history | ⬜ |
| 5 | MockMvc test: Trigger run → 202 Accepted | ⬜ |

- **Commit:** `feat(run): add controller and integration tests`
- **Scope:** M
- **Review:** ⬜ | **Note:**

---

### 🚩 Checkpoint: Phase 3 (Core Business Logic)

| # | Kiểm tra | Status |
|---|----------|--------|
| 1 | `mvn test` — All tests pass (bao gồm cả E1–E7) | ⬜ |
| 2 | Luồng end-to-end: Tạo Project → Tạo Target → Tạo Dataset → Import TestCase → Tạo Assertion → Trigger Run → Verify message xuất hiện trong Redis Stream | ⬜ |
| 3 | Review với team trước khi tiếp tục sang E8–E10 | ⬜ |
