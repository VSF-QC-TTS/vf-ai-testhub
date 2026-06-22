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
    navigation: {
      toggleMenu: "Mở menu",
      menu: "Menu điều hướng",
      toggleLanguage: "Chuyển ngôn ngữ",
      toggleUserMenu: "Mở menu người dùng",
      myAccount: "Tài khoản của tôi",
      profile: "Hồ sơ cá nhân",
      settings: "Cài đặt",
      logout: "Đăng xuất",
    },
    comingSoon: {
      title: "Tính năng sắp ra mắt",
      desc: "Trang này đang được xây dựng.",
    },
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
      cancel: "Hủy",
      save: "Lưu",
      saveChanges: "Lưu thay đổi",
      edit: "Sửa",
      deleteConfirm: "Bạn có chắc chắn muốn xóa mục này? Hành động này không thể hoàn tác."
    },
    optional: "Tùy chọn",
    description: "Mô tả"
  },
  home: {
    title: "AI TestHub",
    totalProjects: "Tổng số dự án",
    noProjects: {
      title: "Chưa có dự án nào",
      description: "Bạn chưa có dự án nào. Hãy tạo dự án để bắt đầu."
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
    gate: {
      errorTitle: "Không tải được danh sách dự án",
      errorDesc: "Hãy tải lại trang hoặc mở phần quản lý dự án để khôi phục không gian làm việc.",
      staleTitle: "Không tìm thấy dự án",
      staleDesc: "Dự án trong URL này không còn tồn tại hoặc bạn không còn quyền truy cập.",
      manageCta: "Xem dự án",
    },
    create: {
      back: "Quay lại danh sách dự án",
      title: "Tạo dự án đầu tiên",
      desc: "Dự án gom target, dữ liệu, lượt chạy và báo cáo vào cùng một ngữ cảnh làm việc.",
      submit: "Tạo dự án",
    },
    overview: {
      eyebrow: "Không gian làm việc",
      createTarget: "Tạo mục tiêu",
      manageTargets: "Quản lý mục tiêu",
      targetCount_one: "{{count}} mục tiêu",
      targetCount_other: "{{count}} mục tiêu",
      notConfigured: "Chưa cấu hình",
      settings: "Cài đặt dự án",
      resources: "Tài nguyên dự án",
      setup: {
        target: {
          title: "Cấu hình mục tiêu đầu tiên",
          description: "Bắt đầu bằng cách kết nối với một API endpoint hoặc môi trường mà bạn muốn kiểm thử."
        },
        dataset: {
          title: "Nhập dữ liệu",
          description: "Bạn đã có mục tiêu. Bây giờ hãy nhập ca kiểm thử hoặc bộ dữ liệu để bắt đầu chạy.",
          action: "Nhập dữ liệu"
        },
        run: {
          title: "Chạy kiểm thử đầu tiên",
          description: "Môi trường và dữ liệu đã sẵn sàng. Thực thi kiểm thử để xem kết quả.",
          action: "Chạy dữ liệu"
        },
        dashboard: {
          title: "Dashboard đang được xây dựng",
          description: "Khi có dữ liệu chạy kiểm thử, khu vực này sẽ hiển thị các chỉ số, biểu đồ xu hướng và các lượt chạy gần đây."
        }
      }
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
      archiving: "Đang xóa...",
    },
    switcher: {
      select: "Chọn dự án",
      current: "Dự án hiện tại",
      title: "Dự án",
      create: "Tạo dự án",
      manage: "Quản lý dự án",
    },
  },
  targets: {
    title: "Mục tiêu",
    missingProject: "Vui lòng chọn dự án trước khi quản lý mục tiêu.",
    notFound: "Không tìm thấy mục tiêu yêu cầu.",
    description: "Cấu hình API và môi trường để kiểm thử.",
    create: "Tạo mục tiêu",
    edit: "Sửa mục tiêu",
    empty: {
      title: "Chưa có mục tiêu",
      description: "Thiết lập mục tiêu API đầu tiên để bắt đầu đánh giá prompt và kiểm thử endpoint."
    },
    searchPlaceholder: "Tìm kiếm mục tiêu...",
    noUrl: "Không có URL",
    primary: "Chính",
    delete: {
      title: "Xóa mục tiêu",
      desc: "Mục tiêu này sẽ bị xóa khỏi dự án hiện tại. Lịch sử các lượt chạy không thay đổi.",
      confirm: "Xóa",
      deleting: "Đang xóa...",
    },
    workbench: {
      createTitle: "Tạo mục tiêu",
      editTitle: "Sửa mục tiêu",
      createDesc: "Thiết lập mục tiêu API mới.",
      quickImport: {
        title: "Nhập nhanh (cURL)",
        placeholder: "Dán lệnh cURL của bạn vào đây để tự động điền cấu hình bên dưới...",
        parse: "Phân tích",
        parsing: "Đang phân tích..."
      },
      httpConfig: {
        title: "Cấu hình HTTP",
        method: "Phương thức",
        url: "URL",
        urlPlaceholder: "https://api.example.com/v1/chat",
        headers: "Headers",
        body: "Body (JSON)",
        auth: "Xác thực",
        headersDesc: "Định nghĩa HTTP headers tùy chỉnh. Sử dụng cú pháp {{variable}} cho các giá trị động.",
        bodyDesc: "Định nghĩa template cho payload của request body.",
        authDesc: "Form xác thực sẽ được hiển thị ở đây dựa trên loại xác thực."
      },
      responseMapping: {
        title: "Ánh xạ phản hồi",
        desc: "Ánh xạ các trường từ phản hồi JSON của API sang các số liệu Đánh giá chuẩn bằng biểu thức JSONPath.",
        answerPath: "Đường dẫn câu trả lời",
        answerPathPlaceholder: "VD: data.choices[0].message.content",
        sourcesPath: "Đường dẫn nguồn/trích dẫn",
        sourcesPathPlaceholder: "VD: data.metadata.citations",
        latencyPath: "Đường dẫn độ trễ",
        latencyPathPlaceholder: "VD: metrics.total_time_ms",
        missingFieldBehavior: "Xử lý khi thiếu trường",
        fail: "FAIL (Đánh dấu test là lỗi)",
        skip: "SKIP (Bỏ qua trường bị thiếu)",
        warning: "WARNING (Ghi log cảnh báo)"
      },
      settings: {
        title: "Cài đặt chung",
        name: "Tên mục tiêu *",
        namePlaceholder: "VD: Production RAG API",
        environment: "Môi trường",
        envDev: "Phát triển (dev)",
        envStaging: "Kiểm thử (staging)",
        envProd: "Sản phẩm (prod)",
        timeout: "Thời gian chờ (ms)",
        testConnection: "Kiểm tra kết nối"
      }
    }
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
    boundaryTitle: "Đã xảy ra lỗi",
    boundaryDesc: "Ứng dụng gặp lỗi ngoài dự kiến.",
  },
  status: {
    active: "Hoạt động",
    inactive: "Không hoạt động",
  },
};
