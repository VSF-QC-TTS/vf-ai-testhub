## E2: Target & ResponseMapping Module

> Dependency: E1 (Project phải tồn tại trước khi tạo Target)

### E2.1: Entity + DTO + Mapper

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Tạo `Target` entity (FK tới Project) theo Database_Design (Hỗ trợ cả HTTP và LLM config) | ✅ |
| 2 | Tạo `ResponseMapping` entity (FK tới Target, 1-1) | ✅ |
| 3 | Tạo DTO: `TargetRequest`, `TargetResponse`, `ResponseMappingRequest`, `ResponseMappingResponse` | ✅ |
| 4 | Tạo `TargetMapper`, `ResponseMappingMapper` (MapStruct) | ✅ |
| 5 | Tạo Flyway migration cho bảng `targets` và `response_mappings` | ✅ |

- **Commit:** `feat(target): add target and response mapping entities, dto, mapper`
- **Review:** ✅ | **Note:**

---

### E2.2: cURL Parser Service

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Tạo `CurlParserService` nhận chuỗi cURL string | ✅ |
| 2 | Parse ra: method, url, headers, body | ✅ |
| 3 | Sinh `bodyTemplate` với placeholder `{{input}}` | ✅ |
| 4 | Unit test: Parse cURL POST có JSON body → đúng method, url, headers | ✅ |
| 5 | Unit test: Parse cURL GET có query params → đúng url + query | ✅ |
| 6 | Unit test: cURL không hợp lệ → throw BusinessException | ✅ |

- **Commit:** `feat(target): add curl parser service with unit tests`
- **Review:** ✅ | **Note:**

---

### E2.3: TargetService + ResponseMappingService

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Tạo `TargetService` CRUD (liên kết ProjectId) | ✅ |
| 2 | Tạo `ResponseMappingService` CRUD (liên kết TargetId) | ✅ |
| 3 | Logic: Khi tạo Target từ cURL, tự động gọi `CurlParserService` | ✅ |
| 4 | Unit test cho cả 2 service bằng Mockito | ✅ |

- **Commit:** `feat(target): add target and response mapping services`
- **Review:** ✅ | **Note:**

---

### E2.4: Controller + Tests

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Tạo `TargetController` (`/api/projects/{projectId}/targets`) | ✅ |
| 2 | Endpoint đặc biệt: `POST /parse-curl` nhận raw cURL → trả Target preview | ✅ |
| 3 | Tạo `ResponseMappingController` (`/api/targets/{targetId}/response-mapping`) | ✅ |
| 4 | MockMvc test: Tạo target từ cURL → 201 | ✅ |
| 5 | MockMvc test: Cập nhật ResponseMapping → 200 | ✅ |

- **Commit:** `feat(target): add controllers and integration tests`
- **Review:** ✅ | **Note:**
