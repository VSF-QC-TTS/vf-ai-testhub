# Agent Workflow & Delegation Guidelines

This document serves as the **Source of Truth** for coordinating autonomous Subagents (Coder & Reviewer) in the project. Any main agent or orchestrator must read and follow this guide when assigning tasks.

## 1. Context Reading (Hiểu Context)
Trước khi giao việc hoặc code, các agent **phải** đọc các file sau:
- `apps/api/CONTEXT.md`: Chứa rules bắt buộc (JavaDoc header, `publicId` UUID, DTO `record`, explicit validation messages, v.v.). Đây là tài liệu sống (living document).
- `docs/tasks/TASKS_Backend.md`: Chứa task breakdown và checklist. Chỉ làm đúng scope được giao.

## 2. MCP Tools (Kỹ năng AI)
Các subagents (nếu được bật `enable_mcp_tools: true`) NÊN sử dụng các MCP từ `agent-skills-standard` để lấy thông tin:
- **Planning**: Dùng `load_skills_for_keywords` (VD: `["java 21", "jpa", "spring"]`) để load guidelines chung trước khi code.
- **Coding**: Dùng `load_skills_for_files` dựa trên tên file chuẩn bị sửa (VD: `*Repository.java`) để lấy practices và anti-patterns cụ thể.
- **Reviewing**: Dùng `audit_session_compliance` (nếu cần) hoặc đối chiếu thủ công với file `CONTEXT.md`.

## 3. Workflow "Ping-Pong" Luân Phiên (BẮT BUỘC)
Để tránh tình trạng Coder ôm hết việc và tự commit phá vỡ quy trình, quá trình phát triển **phải tuân thủ** luồng sau:

### Bước 1: Giao việc cho Coder (Micro-tasking)
- **Scope**: Giao **TỪNG TASK NHỎ** (Ví dụ: Chỉ giao `E3.1` thay vì toàn bộ `Epic E3`).
- **Prompt bắt buộc**:
  > "Triển khai task X. Tuân thủ `CONTEXT.md`. **TUYỆT ĐỐI KHÔNG DÙNG LỆNH `git commit`**. Sau khi code xong và test pass (chạy `mvn test`), hãy giữ nguyên trạng thái Unstaged/Staged và báo cáo lại để tôi chuyển cho Reviewer."

### Bước 2: Reviewer kiểm tra
- **Scope**: Review các file bị thay đổi đang ở trạng thái unstaged/staged thông qua git diff.
- **Checklist Reviewer**:
  1. Kiểm tra Javadoc header (`@author`, `@since`) trên TẤT CẢ các file `.java` mới.
  2. Kiểm tra expose `publicId` (UUID) và sử dụng Java `record` cho DTO.
  3. Kiểm tra các validation annotation phải có explicit `message`.
  4. Nếu Coder code sai: Trả về feedback rõ ràng và ép Coder sửa.
  5. Nếu pass: Chuyển sang Bước 3.

### Bước 3: Cập nhật tài liệu & Commit (Chỉ do Reviewer thực hiện)
- Khi code đã đạt chuẩn, Reviewer phải **tự động cập nhật** `apps/api/CONTEXT.md` (Ghi nhận thêm API/Domain mới nếu có).
- Reviewer tự thực hiện lệnh gom code:
  `git add .`
  `git commit -m "feat(scope): mô tả"`

Lặp lại quy trình 3 bước này cho các task tiếp theo (E3.2, E3.3...). Đảm bảo tính kiểm soát tuyệt đối sau mỗi nhịp (Ping - Pong).
