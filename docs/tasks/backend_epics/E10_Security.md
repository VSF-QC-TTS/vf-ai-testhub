## E10: Security Module

> Dependency: E0 (Foundation). Có thể làm song song với các Epic khác.

### E10.1: JWT Filter + AuthConfig

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Tạo `JwtAuthFilter` extends `OncePerRequestFilter` | ✅ |
| 2 | Tạo `SecurityConfig` (`@EnableWebSecurity`) — whitelist public endpoints, protect `/api/**` | ✅ |
| 3 | Inject `userId` vào SecurityContext sau khi verify token | ✅ |

- **Commit:** `feat(security): add jwt authentication filter`
- **Review:** `DONE` | **Note:** Đã được team triển khai sẵn đầy đủ.

---

### E10.2: SSRF Protection (InetAddressFilter)

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Tạo `SsrfValidator` sử dụng `InetAddressFilter` của Spring Boot 4.1.0 | ⬜ |
| 2 | Tích hợp vào `TargetService` — validate URL trước khi lưu Target | ⬜ |
| 3 | Unit test: URL `http://127.0.0.1` → reject | ⬜ |
| 4 | Unit test: URL `http://10.0.0.1` → reject | ⬜ |
| 5 | Unit test: URL `https://chatbot.example.com` → pass | ⬜ |

- **Commit:** `feat(security): add ssrf protection for target urls`
- **Review:** ⬜ | **Note:**

---

### E10.3: SecurityFilterTest (MockMvc)

| # | Checklist | Status |
|---|-----------|--------|
| 1 | Test: `GET /api/projects` không có token → 401 | ⬜ |
| 2 | Test: `GET /api/projects` có token hợp lệ → 200 | ⬜ |
| 3 | Test: User A truy cập project của User B → 403 | ⬜ |

- **Commit:** `test(security): add security filter integration tests`
- **Review:** ⬜ | **Note:**
