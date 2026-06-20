## E9: AI Integration Module

> Dependency: E4 (TestCase), E5 (Assertion)
>
> ⚠️ Module này gọi LLM API bên ngoài. TUYỆT ĐỐI dùng WireMock trong test.

### E9.1: AIGeneratorService (Testcase generation)

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Tạo `AIGeneratorService` — nhận requirement text, gọi LLM API, parse response thành `List<TestCaseDraft>` | ⬜ |
| 2 | Tạo `PromptTemplateBuilder` — ghép requirement + component list + tool list thành prompt | ⬜ |
| 3 | Xử lý retry khi LLM trả về response không parse được (max 2 lần) | ⬜ |

- **Commit:** `feat(ai): add ai testcase generator service`
- **Review:** ⬜ | **Note:**

---

### E9.2: AI Assertion suggestion

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Tạo method `suggestAssertions(testCase, responseMapping)` trong AIGeneratorService | ⬜ |
| 2 | LLM nhận expectedBehavior + danh sách components → gợi ý assertions | ⬜ |
| 3 | Parse response thành `List<AssertionDraft>` | ⬜ |

- **Commit:** `feat(ai): add ai assertion suggestion`
- **Review:** ⬜ | **Note:**

---

### E9.3: Tests (WireMock)

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Setup WireMock chặn endpoint LLM API | ⬜ |
| 2 | Test: LLM trả JSON chuẩn → parse thành công | ⬜ |
| 3 | Test: LLM trả text rác (không phải JSON) → retry rồi throw exception | ⬜ |
| 4 | Test: LLM timeout → throw exception đúng loại | ⬜ |

- **Commit:** `test(ai): add wiremock tests for ai services`
- **Review:** ⬜ | **Note:**
