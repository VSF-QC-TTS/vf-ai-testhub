export const vi = {
  api: {
    BAD_CREDENTIALS: "Email hoặc mật khẩu không chính xác.",
    EMAIL_ALREADY_EXISTS: "Email này đã được sử dụng bởi tài khoản khác.",
    USERNAME_ALREADY_EXISTS: "Tên người dùng đã tồn tại.",
    VALIDATION_ERROR: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",
    USER_NOT_FOUND: "Không tìm thấy thông tin tài khoản.",
    INVALID_ACCESS_TOKEN: "Phiên đăng nhập không hợp lệ.",
    INVALID_REFRESH_TOKEN: "Phiên đăng nhập đã hết hạn.",
    ACCOUNT_LOCKED: "Tài khoản của bạn đã bị khóa.",
    EMAIL_NOT_VERIFIED: "Vui lòng xác thực email trước khi đăng nhập.",
    WRONG_PASSWORD: "Mật khẩu hiện tại không đúng.",
    INTERNAL_SERVER_ERROR: "Lỗi hệ thống. Vui lòng thử lại sau.",
    UNAUTHORIZED: "Bạn cần đăng nhập để thực hiện hành động này.",
    PROJECT_NOT_FOUND: "Không tìm thấy dự án yêu cầu.",
    TARGET_NOT_FOUND: "Không tìm thấy mục tiêu yêu cầu.",
  },
  common: {
    language: "Ngôn ngữ",
    english: "Tiếng Anh",
    vietnamese: "Tiếng Việt",
    loading: "Đang tải...",
    home: "Trang chủ",
    settings: "Cài đặt",
    validation: {
      required: "Trường này là bắt buộc",
      invalidEmail: "Địa chỉ email không hợp lệ",
      invalidUrl: "URL không hợp lệ",
      invalidId: "Định dạng UUID không hợp lệ",
      maxLength: "Tối đa {{max}} ký tự",
      minLength: "Tối thiểu {{min}} ký tự",
      min: "Phải lớn hơn hoặc bằng {{min}}",
      max: "Phải nhỏ hơn hoặc bằng {{max}}"
    },
    actions: {
      deleteConfirm: "Bạn có chắc chắn muốn xóa mục này? Hành động này không thể hoàn tác."
    }
  },
  auth: {
    hero: {
      headline: "Kiểm soát\nchất lượng.",
      slogan: "Tập trung quản lý test case, tự động hóa kiểm thử hồi quy và tự tin triển khai hệ thống.",
      liveExecution: "Tiến trình chạy",
      privacy: "Bảo mật",
      terms: "Điều khoản",
      logs: {
        auth: "Xác thực API token...",
        regression: "Thực thi test suite #402",
        validate: "Kiểm thử API thanh toán",
        evaluate: "Kiểm chứng phản hồi LLM"
      }
    },
    login: {
      title: "Chào mừng trở lại",
      description: "Đăng nhập vào tài khoản của bạn để tiếp tục",
      email: "Email",
      password: "Mật khẩu",
      forgotPassword: "Quên mật khẩu?",
      error: "Đăng nhập thất bại",
      submit: "Đăng nhập",
      orContinueWith: "Hoặc tiếp tục với",
      noAccount: "Chưa có tài khoản? ",
      register: "Đăng ký",
      oauth: {
        github: "GitHub",
        google: "Google"
      }
    },
    register: {
      title: "Tạo tài khoản",
      description: "Nhập thông tin của bạn để bắt đầu",
      displayName: "Tên hiển thị",
      email: "Email",
      password: "Mật khẩu",
      confirmPassword: "Nhập lại mật khẩu",
      passwordsDoNotMatch: "Mật khẩu không khớp.",
      error: "Đăng ký thất bại",
      submit: "Tạo tài khoản",
      hasAccount: "Đã có tài khoản? ",
      login: "Đăng nhập",
      oauth: {
        github: "GitHub",
        google: "Google"
      }
    },
    forgotPassword: {
      title: "Khôi phục mật khẩu",
      description: "Nhập địa chỉ email của bạn và chúng tôi sẽ gửi liên kết để đặt lại mật khẩu.",
      email: "Email",
      error: "Gửi liên kết thất bại",
      submit: "Gửi liên kết",
      successTitle: "Kiểm tra email của bạn",
      successDesc: "Nếu email hợp lệ, một liên kết khôi phục đã được gửi.",
      backToLogin: "Quay lại đăng nhập"
    },
    logout: "Đăng xuất",
  },
  projects: {
    title: "Dự án",
    new: "Tạo dự án",
    empty: {
      title: "Chưa có dự án nào",
      desc: "Tạo dự án đầu tiên của bạn để bắt đầu cấu hình API và chạy test.",
      cta: "Tạo dự án mới",
    },
    list: {
      desc: "Quản lý các không gian làm việc và môi trường kiểm thử API của bạn.",
      noDescription: "Không có mô tả.",
      createdAt: "Tạo ngày {{date}}",
      search: "Tìm kiếm dự án...",
      create: "Tạo dự án",
      columns: {
        name: "Tên dự án",
        createdAt: "Ngày tạo",
        actions: "Hành động",
      },
    },
    form: {
      createTitle: "Tạo dự án mới",
      createDesc: "Nhập thông tin cơ bản cho dự án của bạn.",
      editTitle: "Chỉnh sửa dự án",
      name: "Tên dự án",
      namePlaceholder: "VD: Hệ thống Phân tích",
      description: "Mô tả",
      descPlaceholder: "Chi tiết tùy chọn...",
      cancel: "Hủy",
      submit: "Lưu",
      creating: "Đang tạo...",
      updating: "Đang cập nhật...",
    },
    delete: {
      title: "Xóa dự án",
      desc: "Bạn có chắc chắn muốn xóa dự án này? Hành động này không thể hoàn tác.",
      confirm: "Xóa",
      cancel: "Hủy",
    },
    switcher: {
      select: "Chọn dự án",
      title: "Dự án",
      create: "Tạo dự án",
      manage: "Quản lý dự án",
    },
  },
  targets: {
    title: "Mục tiêu",
  },
  datasets: {
    title: "Tập dữ liệu",
  },
  testCases: {
    title: "Ca kiểm thử",
  },
  runs: {
    title: "Lượt chạy",
  },
  reports: {
    title: "Báo cáo",
  },
  rubrics: {
    title: "Tiêu chí",
  },
  errors: {
    unknown: "Lỗi không xác định",
  },
  status: {
    active: "Hoạt động",
    inactive: "Không hoạt động",
  },
};
