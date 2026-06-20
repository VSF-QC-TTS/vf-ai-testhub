## E5: Assertion & ToolExpectation Module

> Dependency: E4 (TestCase)

### E5.1: Assertion Entity + DTO + Mapper

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Tạo `Assertion` entity (FK tới TestCase) theo Database_Design — scope, type (kể cả RANGE, SCHEMA), targetComponent, fieldPath... | ⬜ |
| 2 | Tạo `AssertionRequest`, `AssertionResponse` DTO | ⬜ |
| 3 | Tạo `AssertionMapper` (MapStruct) | ⬜ |
| 4 | Tạo Flyway migration cho bảng `assertions` | ⬜ |

- **Commit:** `feat(assertion): add entity, dto, mapper and migration`
- **Review:** ⬜ | **Note:**

---

### E5.2: ToolExpectation Entity + DTO + Mapper

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Tạo `ToolExpectation` entity (FK tới TestCase) | ⬜ |
| 2 | Tạo `ToolExpectationRequest`, `ToolExpectationResponse` DTO | ⬜ |
| 3 | Tạo `ToolExpectationMapper` (MapStruct) | ⬜ |
| 4 | Tạo Flyway migration cho bảng `tool_expectations` | ⬜ |

- **Commit:** `feat(tool-expectation): add entity, dto, mapper and migration`
- **Review:** ⬜ | **Note:**

---

### E5.3: Services

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Tạo `AssertionService` CRUD (liên kết TestCaseId) | ⬜ |
| 2 | Tạo `ToolExpectationService` CRUD (liên kết TestCaseId) | ⬜ |
| 3 | Unit test cả 2 services | ⬜ |

- **Commit:** `feat(assertion): add assertion and tool expectation services`
- **Review:** ⬜ | **Note:**

---

### E5.4: Controller + Tests

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Tạo `AssertionController` (`/api/testcases/{testCaseId}/assertions`) | ⬜ |
| 2 | Tạo `ToolExpectationController` (`/api/testcases/{testCaseId}/tool-expectations`) | ⬜ |
| 3 | MockMvc test: CRUD endpoints cho cả 2 | ⬜ |
| 4 | MockMvc test: Tạo assertion với type không hợp lệ → 400 | ⬜ |

- **Commit:** `feat(assertion): add controllers and integration tests`
- **Review:** ⬜ | **Note:**
