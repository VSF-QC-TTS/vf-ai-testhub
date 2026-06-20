## E0: Foundation & Infrastructure

> Nền tảng dự án. Tất cả các Epic khác phụ thuộc vào Epic này.

### E0.1: Project scaffold + dependencies

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Khởi tạo Spring Boot 4.1.0 project từ template của team | ✅ |
| 2 | Thêm dependencies: Lombok, MapStruct, Spring Data JPA, Spring Data Redis, Validation, Web | ✅ |
| 3 | Cấu hình `application.yml` (datasource, redis, server port) | ✅ |
| 4 | Cấu hình Lombok annotation processor + MapStruct trong build tool | ✅ |
| 5 | Verify: `mvn compile` hoặc `gradle build` thành công, không lỗi | ✅ |

- **Commit:** `chore(api): init spring boot project with core dependencies`
- **Scope:** S
- **Review:** `DONE` | **Note:** Đã được khởi tạo sẵn trong codebase.

---

### E0.2: Global config (Exception, Validation, CORS)

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Tạo `GlobalExceptionHandler` (`@ControllerAdvice`) trả JSON chuẩn `{error, message, timestamp}` | ✅ |
| 2 | Tạo custom exception classes: `ResourceNotFoundException`, `BusinessException` | ✅ |
| 3 | Cấu hình CORS cho phép `localhost:5173` (Vite dev server) | ✅ |
| 4 | Cấu hình `MessageSource` cho validation messages (nếu cần i18n) | ✅ |
| 5 | Test: Gọi API không tồn tại → trả đúng format JSON lỗi | ✅ |

- **Commit:** `feat(api): add global exception handler and CORS config`
- **Scope:** S
- **Review:** `DONE` | **Note:** Đã được code sẵn (xem package exception, config).

---

### E0.3: Database connection + migration tool

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Cấu hình `application.yml` kết nối PostgreSQL từ `docker-compose.yml` | ✅ |
| 2 | Chọn và cài migration tool (Flyway hoặc Liquibase) | ✅ |
| 3 | Tạo migration script V1 (schema ban đầu — có thể rỗng hoặc chứa bảng `projects`) | ✅ |
| 4 | Verify: App khởi động thành công, migration chạy đúng, bảng được tạo | ✅ |

- **Commit:** `feat(api): configure postgresql and flyway migration`
- **Scope:** S
- **Review:** `DONE` | **Note:** Đã cấu hình Flyway, V1__init_schema.sql (Auth) đã tồn tại.

---

### E0.4: Redis Streams connection

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Cấu hình `spring-data-redis` kết nối Redis từ `docker-compose.yml` | ✅ |
| 2 | Tạo `RedisStreamConfig` bean (StringRedisTemplate, StreamOperations) | ✅ |
| 3 | Viết hàm util `publishToStream(streamKey, payload)` dùng `XADD` | ✅ |
| 4 | Test: Gọi hàm publish, kiểm tra message xuất hiện trong Redis | ✅ |

- **Commit:** `feat(api): configure redis streams connection and publisher util`
- **Scope:** S
- **Review:** ✅ | **Note:**

---

### 🚩 Checkpoint: Phase 1 (Foundation)

| # | Kiểm tra | Status |
|---|----------|--------|
| 1 | `mvn compile` thành công, không lỗi | ✅ |
| 2 | `mvn test` pass (nếu có test) | ✅ |
| 3 | App khởi động được, kết nối PostgreSQL + Redis thành công | ✅ |
| 4 | Review với team trước khi tiếp tục | ✅ |
