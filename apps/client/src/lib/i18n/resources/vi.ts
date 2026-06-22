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
    description: "Mô tả",
    roles: {
      QC_MEMBER: "Thành viên",
      QC_LEAD: "Trưởng nhóm",
      QC_MANAGER: "Quản lý",
      ADMIN: "Quản trị viên",
      USER: "Người dùng"
    }
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
        }
      },
      metrics: {
        totalTestCases: "Tổng số Test Case",
        activeTargets: "Mục tiêu hoạt động",
        datasets: "Bộ dữ liệu",
        rubrics: "Tiêu chí đánh giá"
      },
      recentRuns: "Các lượt chạy gần đây",
      recentRunsUnavailable: "Danh sách lượt chạy gần đây sẽ hiển thị khi hệ thống hỗ trợ API tổng hợp cấp độ dự án.",
      viewAllRuns: "Xem tất cả",
      configSummary: "Tóm tắt cấu hình",
      targetsConfigured: "Mục tiêu đã cấu hình",
      datasetsImported: "Bộ dữ liệu đã nhập",
      rubricsDefined: "Tiêu chí đã tạo"
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
    import: {
      title: "Nhập Kịch bản",
      uploadDesc: "Tải lên tệp CSV, XLS hoặc XLSX để nhập kịch bản kiểm thử.",
      previewDesc: "Xem lại các cột được phát hiện và ánh xạ chúng.",
      resultDesc: "Quá trình nhập đã hoàn tất.",
      clickToSelect: "Nhấp để chọn tệp",
      supportedFiles: "Định dạng hỗ trợ: .csv, .xls, .xlsx",
      selectFile: "Chọn tệp",
      preview: "Xem trước",
      uploading: "Đang tải lên...",
      previewFailed: "Lỗi tải lên tệp để xem trước",
      totalRows: "Tổng số dòng",
      columnsDetected: "Số cột phát hiện",
      mappedFields: "Số cột đã ánh xạ",
      duplicates: "Bị trùng lặp",
      columnMapping: "Ánh xạ cột",
      fileColumn: "Cột trong tệp",
      mapToField: "Ánh xạ tới trường",
      dataPreview: "Dữ liệu xem trước",
      defaultTags: "Nhãn mặc định",
      skipDuplicates: "Bỏ qua các External ID trùng lặp",
      confirmImport: "Xác nhận nhập",
      importing: "Đang nhập...",
      confirmFailed: "Lỗi khi xác nhận nhập",
      success: "Nhập thành công",
      inputRequired: "Trường Đầu vào phải được ánh xạ tới một cột",
      importComplete: "Nhập hoàn tất",
      importCompleteWithErrors: "Nhập hoàn tất với lỗi",
      imported: "Đã nhập",
      skipped: "Bỏ qua",
      errors: "Lỗi",
      errorDetails: "Chi tiết lỗi",
      row: "Dòng",
      reason: "Nguyên nhân"
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
    description: "Quản lý tập dữ liệu và các ca kiểm thử.",
    missingProject: "Vui lòng chọn dự án trước khi quản lý dữ liệu.",
    create: "Tạo tập dữ liệu",
    empty: {
      title: "Chưa có tập dữ liệu",
      description: "Nhập dữ liệu hoặc tạo tập dữ liệu mới để bắt đầu đánh giá AI."
    },
    emptySearch: "Không tìm thấy tập dữ liệu nào phù hợp.",
    searchPlaceholder: "Tìm kiếm tập dữ liệu...",
    fields: {
      name: "Tên tập dữ liệu",
      category: "Danh mục",
      tags: "Nhãn",
      testCaseCount: "Test cases",
      updatedAt: "Ngày cập nhật"
    },
    form: {
      createTitle: "Tạo tập dữ liệu",
      editTitle: "Chỉnh sửa tập dữ liệu",
      createDesc: "Gom nhóm các ca kiểm thử thành những tập dữ liệu dễ quản lý.",
      name: "Tên tập dữ liệu *",
      namePlaceholder: "VD: Dữ liệu QA Chatbot",
      category: "Danh mục",
      categoryPlaceholder: "VD: Phân loại ý định",
      description: "Mô tả",
      descPlaceholder: "Mô tả mục đích của tập dữ liệu này..."
    },
    delete: {
      step3Title: "Tạo tập dữ liệu",
      step3Desc: "Đặt tên cho tập dữ liệu mới để lưu bài kiểm tra.",
      step3Placeholder: "VD: Test hồi quy đăng nhập",
      submit: "Nhập & Tạo",
      importing: "Đang nhập...",
      success: "Nhập test case thành công."
    }
  },
  rubrics: {
    title: "Rubric",
    description: "Quản lý hướng dẫn cho LLM Judge để đánh giá test case.",
    create: "Tạo Rubric",
    edit: "Sửa Rubric",
    searchPlaceholder: "Tìm kiếm rubric...",
    empty: {
      title: "Chưa có Rubric nào",
      description: "Bạn chưa tạo rubric đánh giá nào cho dự án này."
    },
    fields: {
      name: "Tên",
      category: "Danh mục",
      scope: "Phạm vi",
      language: "Ngôn ngữ",
      content: "Prompt",
      threshold: "Ngưỡng đạt"
    },
    categories: {
      ANSWER_QUALITY: "Chất lượng câu trả lời",
      POLICY_COMPLIANCE: "Tuân thủ chính sách",
      NO_HALLUCINATION: "Không ảo giác",
      SAFETY_REFUSAL: "Từ chối an toàn",
      RAG_FAITHFULNESS: "Tính trung thực (RAG)",
      TOOL_OUTPUT_USAGE: "Sử dụng kết quả công cụ",
      SUGGESTION_RELEVANCE: "Gợi ý phù hợp",
      VIETNAMESE_TONE: "Giọng điệu Tiếng Việt",
      CLARIFYING_QUESTION: "Câu hỏi làm rõ",
      BUSINESS_ACCEPTANCE: "Đáp ứng nghiệp vụ"
    },
    form: {
      createTitle: "Tạo Rubric Mới",
      createDesc: "Định nghĩa hướng dẫn cho LLM Judge.",
      editTitle: "Sửa Rubric",
      editDesc: "Cập nhật nội dung hướng dẫn.",
      name: "Tên",
      namePlaceholder: "VD: Giọng điệu lịch sự",
      description: "Mô tả",
      descPlaceholder: "Mô tả ngắn gọn (tùy chọn)",
      category: "Danh mục",
      categoryPlaceholder: "Chọn danh mục...",
      language: "Ngôn ngữ",
      threshold: "Ngưỡng đạt",
      content: "Prompt",
      contentPlaceholder: "VD: Câu trả lời phải giữ thái độ lịch sự, chuyên nghiệp...",
      messages: {
        created: "Tạo rubric thành công",
        updated: "Cập nhật rubric thành công",
        createFailed: "Tạo rubric thất bại",
        updateFailed: "Cập nhật rubric thất bại"
      }
    },
    delete: {
      title: "Xóa Rubric",
      desc: "Bạn có chắc chắn muốn xóa rubric này? Các bài test đang dùng nó sẽ quay về mặc định.",
      confirm: "Xóa",
      deleting: "Đang xóa..."
    },
    archive: {
      title: "Lưu trữ Rubric",
      desc: "Bạn có chắc chắn muốn lưu trữ rubric này? Nó sẽ không còn dùng được cho các đánh giá mới.",
      confirm: "Lưu trữ",
      archiving: "Đang lưu trữ..."
    }
  },
  ai: {
    generateTitle: "Tự động tạo Test Case",
    generateDesc: "Sử dụng AI để tự động tạo nháp các test case dựa trên yêu cầu nghiệp vụ.",
    featureName: "Tên tính năng",
    featureNamePlaceholder: "VD: Luồng Quên Mật Khẩu",
    businessRequirement: "Yêu cầu Nghiệp vụ",
    businessRequirementPlaceholder: "Mô tả hành vi của tính năng, đầu vào, đầu ra, và các trường hợp ngoại lệ...",
    generateBtn: "Tạo Nháp",
    generating: "Đang phân tích...",
    reviewTitle: "Xem xét bản nháp",
    discardAll: "Hủy tất cả",
    saveSelected: "Lưu mục đã chọn",
    noDrafts: "Không thể tạo bản nháp. Thử điều chỉnh lại yêu cầu của bạn."
  },
  testCases: {
    title: "Ca kiểm thử",
  },
  runs: {
    title: "Lượt chạy",
    history: {
      title: "Lịch sử chạy",
      description: "Xem lại lịch sử các lần chạy kiểm thử cho tập dữ liệu này.",
      noRuns: "Chưa có lượt chạy nào",
      noRunsDesc: "Hiện tại chưa có dữ liệu về các lượt chạy kiểm thử.",
      runId: "Mã lượt chạy",
      status: "Trạng thái",
      mode: "Chế độ",
      cases: "Tổng số ca",
      passed: "Thành công",
      failed: "Thất bại",
      date: "Ngày chạy",
      viewReport: "Xem báo cáo"
    },
    status: {
      COMPLETED: "Hoàn thành",
      FAILED: "Thất bại",
      CANCELLED: "Đã hủy",
      RUNNING: "Đang chạy",
      PENDING: "Chờ xử lý",
      UNCERTAIN: "Không chắc chắn",
      ERROR: "Lỗi"
    },
    modes: {
      FULL: "Đầy đủ",
      SMOKE: "Nhanh (Smoke)"
    }
  },
  reports: {
    title: "Báo cáo",
  },
  experiments: {
    title: "Thử nghiệm A/B",
    empty: {
      title: "Chưa có thử nghiệm nào",
      description: "Bắt đầu thử nghiệm A/B để so sánh các mục tiêu, mô hình hoặc cấu hình khác nhau."
    },
    create: "Tạo thử nghiệm",
    fields: {
      name: "Tên thử nghiệm",
      status: "Trạng thái",
      createdAt: "Ngày tạo"
    },
    form: {
      createTitle: "Tạo thử nghiệm A/B",
      createDesc: "Xác định các biến thể để so sánh hiệu suất.",
      name: "Tên",
      namePlaceholder: "VD: Kiểm tra tối ưu prompt",
      datasetId: "Tập dữ liệu",
      datasetIdPlaceholder: "Chọn tập dữ liệu...",
      variants: "Các biến thể",
      addVariant: "Thêm biến thể",
      variantName: "Tên biến thể",
      variantNamePlaceholder: "VD: Gốc, Mới",
      targetId: "Mục tiêu",
      targetIdPlaceholder: "Chọn mục tiêu...",
      startDesc: "Ước tính số cuộc gọi: {{calls}}. Tiếp tục?",
      startBtn: "Bắt đầu thử nghiệm",
      starting: "Đang bắt đầu..."
    },
    detail: {
      progress: "Tiến độ",
      winner: "Khuyến nghị / Người chiến thắng",
      noWinnerYet: "Đang chờ kết quả để xác định người chiến thắng.",
    }
  },
  compare: {
    title: "So sánh lượt chạy",
    selectRuns: "Chọn lượt chạy để so sánh",
    baseRun: "Lượt chạy gốc",
    candidateRun: "Lượt chạy so sánh",
    compareBtn: "So sánh",
    metrics: {
      regressions: "Lỗi mới",
      fixes: "Đã sửa",
      unchanged: "Không đổi",
      passRateDelta: "Chênh lệch tỷ lệ đạt",
      latencyDelta: "Chênh lệch độ trễ",
      costDelta: "Chênh lệch chi phí"
    },
    diff: {
      expected: "Kỳ vọng",
      actualBase: "Thực tế (Gốc)",
      actualCandidate: "Thực tế (Mới)"
    },
    incompatible: "Các lượt chạy không tương thích. Chúng phải sử dụng cùng một tập dữ liệu."
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
  testcases: {
    title: "Kịch bản kiểm thử",
    description: "Quản lý kịch bản kiểm thử cho tập dữ liệu này.",
    missingDatasetId: "Thiếu ID tập dữ liệu",
    noTestCases: "Chưa có Kịch bản kiểm thử",
    noTestCasesDesc: "Bắt đầu bằng cách thêm một kịch bản hoặc nhập từ một tệp.",
    addTestCase: "Thêm Kịch bản",
    searchPlaceholder: "Tìm kiếm...",
    allPriorities: "Tất cả mức độ ưu tiên",
    allStates: "Tất cả trạng thái",
    enabled: "Đã bật",
    disabled: "Đã tắt",
    sectionPlaceholder: "Phân hệ...",
    tagPlaceholder: "Nhãn...",
    noMatches: "Không có kịch bản nào khớp với bộ lọc.",
    columns: {
      extId: "Mã ngoài",
      section: "Phân hệ",
      input: "Đầu vào",
      expected: "Kỳ vọng",
      tags: "Nhãn",
      priority: "Ưu tiên",
      status: "Trạng thái"
    },
    noInput: "Không có đầu vào",
    delete: {
      title: "Xóa kịch bản kiểm thử",
      desc: "Bạn có chắc chắn muốn xóa kịch bản này không? Hành động này không thể hoàn tác.",
      deleting: "Đang xóa..."
    },
    form: {
      createTitle: "Tạo kịch bản kiểm thử",
      editTitle: "Chỉnh sửa kịch bản kiểm thử",
      createDesc: "Thêm một kịch bản kiểm thử mới vào tập dữ liệu.",
      editDesc: "Thay đổi các thuộc tính của kịch bản kiểm thử.",
      externalId: "Mã ngoài",
      externalIdPlaceholder: "VD: TC001",
      section: "Phân hệ",
      sectionPlaceholder: "VD: Đăng nhập",
      name: "Tên",
      namePlaceholder: "Tên kịch bản ngắn gọn",
      input: "Đầu vào *",
      inputPlaceholder: "Nội dung người dùng gửi cho chatbot",
      expectedBehavior: "Hành vi kỳ vọng",
      expectedBehaviorPlaceholder: "Hành vi kỳ vọng của chatbot",
      referenceAnswer: "Câu trả lời tham khảo",
      referenceAnswerPlaceholder: "Câu trả lời tham khảo cho người đánh giá",
      variables: "Biến số (JSON)",
      formatValidate: "Định dạng / Kiểm tra",
      tags: "Nhãn (ngăn cách bằng dấu phẩy)",
      tagsPlaceholder: "tag1, tag2",
      priority: "Mức độ ưu tiên",
      status: "Trạng thái bật",
      validation: {
        inputRequired: "Đầu vào là bắt buộc",
        invalidJson: "JSON không hợp lệ",
        maxLength: "Không được vượt quá {{max}} ký tự",
        minOrder: "Phải lớn hơn hoặc bằng 0",
        maxOrder: "Không được vượt quá 1000000"
      },
      messages: {
        created: "Đã tạo kịch bản kiểm thử",
        createFailed: "Lỗi khi tạo kịch bản kiểm thử",
        updated: "Đã cập nhật kịch bản kiểm thử",
        updateFailed: "Lỗi khi cập nhật kịch bản kiểm thử",
        deleted: "Đã xóa kịch bản kiểm thử",
        deleteFailed: "Lỗi khi xóa kịch bản kiểm thử",
        unsavedChanges: "Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn đóng?"
      }
    }
  },
  assertions: {
    title: "Assertion",
    addAssertion: "Thêm Assertion",
    emptyDesc: "Chưa cấu hình assertion nào cho kịch bản này.",
    disabled: "Đã tắt",
    scopes: {
      WHOLE_RESPONSE: "Toàn bộ phản hồi",
      FIELD: "Một trường dữ liệu",
      COMPONENT: "Thành phần đã tách",
      MULTI_FIELD: "Nhiều trường",
    },
    scopeDescriptions: {
      WHOLE_RESPONSE: "Chấm toàn bộ payload phản hồi.",
      FIELD: "Chấm một field theo JSONPath, ví dụ $.data.answer.",
      COMPONENT: "Chấm component đã mapping như answer hoặc intent.",
      MULTI_FIELD: "Chấm nhiều field cùng lúc, thường dùng với LLM rubric.",
    },
    groups: {
      TEXT: "Văn bản",
      NUMBER: "Số",
      BOOLEAN: "Đúng/sai hoặc tồn tại",
      ARRAY: "Danh sách",
      LLM: "LLM Rubric",
    },
    groupDescriptions: {
      TEXT: "Từ khóa, câu, regex.",
      NUMBER: "Điểm số, số lượng, latency.",
      BOOLEAN: "True, false, tồn tại.",
      ARRAY: "Độ dài hoặc phần tử.",
      LLM: "Chấm bằng tiêu chí.",
    },
    types: {
      contains: "Có chứa",
      not_contains: "Không chứa",
      equals: "Bằng chính xác",
      not_equals: "Không bằng",
      regex: "Khớp regex",
      greater_than: "Lớn hơn",
      less_than: "Nhỏ hơn",
      between: "Nằm trong khoảng",
      is_true: "Là true",
      is_false: "Là false",
      field_exists: "Field tồn tại",
      field_not_exists: "Field không tồn tại",
      array_length_greater_than: "Độ dài danh sách lớn hơn",
      array_contains: "Danh sách có chứa",
      llm_rubric: "LLM rubric",
    },
    typeDescriptions: {
      contains: "Giá trị thực tế phải chứa đoạn văn bản kỳ vọng.",
      not_contains: "Giá trị thực tế không được chứa đoạn văn bản cấm.",
      equals: "Giá trị thực tế phải bằng chính xác văn bản kỳ vọng.",
      not_equals: "Giá trị thực tế phải khác văn bản kỳ vọng.",
      regex: "Giá trị thực tế phải khớp regex.",
      greater_than: "Số thực tế phải lớn hơn ngưỡng.",
      less_than: "Số thực tế phải nhỏ hơn ngưỡng.",
      between: "Số thực tế phải nằm trong khoảng bao gồm hai đầu.",
      is_true: "Giá trị thực tế phải là true.",
      is_false: "Giá trị thực tế phải là false.",
      field_exists: "Field được chọn phải tồn tại và khác null.",
      field_not_exists: "Field được chọn phải không tồn tại hoặc là null.",
      array_length_greater_than: "Độ dài danh sách phải lớn hơn ngưỡng.",
      array_contains: "Danh sách phải chứa phần tử kỳ vọng.",
      llm_rubric: "Chấm chất lượng phản hồi bằng tiêu chí tái sử dụng hoặc tiêu chí riêng.",
    },
    arrayValueModes: {
      text: "Văn bản",
      number: "Số",
      boolean: "True / false",
      json: "JSON object / array",
    },
    delete: {
      title: "Xóa xác thực",
      desc: "Bạn có chắc chắn muốn xóa xác thực này không?",
      deleting: "Đang xóa..."
    },
    form: {
      createTitle: "Tạo xác thực",
      editTitle: "Sửa xác thực",
      createDesc: "Thêm quy tắc kiểm tra kết quả.",
      editDesc: "Chỉnh sửa quy tắc kiểm tra.",
      steps: {
        scope: "Chọn nơi cần chấm",
        condition: "Chọn điều kiện chấm",
        expected: "Nhập giá trị kỳ vọng",
      },
      scope: "Phạm vi",
      type: "Loại xác thực",
      targetComponent: "Thành phần mục tiêu",
      targetComponentPlaceholder: "VD: answer",
      fieldPath: "Đường dẫn trường",
      fieldPathPlaceholder: "VD: $.data.id",
      fieldPathHint: "Biểu thức JSONPath để chọn một trường cụ thể.",
      fieldPaths: "Nhiều đường dẫn (ngăn cách bằng dấu phẩy)",
      fieldPathsPlaceholder: "$.data.id, $.data.name",
      expectedValue: "Giá trị kỳ vọng",
      expectedValuePlaceholder: "Văn bản hoặc chuỗi JSON",
      expectedNumber: "Số kỳ vọng",
      minValue: "Giá trị nhỏ nhất",
      maxValue: "Giá trị lớn nhất",
      arrayValueMode: "Kiểu phần tử",
      arrayExpectedItem: "Phần tử kỳ vọng",
      noExpectedValueNeeded: "Điều kiện này không cần giá trị kỳ vọng. Runner sẽ kiểm tra trực tiếp field/component đã chọn.",
      formatJson: "Định dạng JSON",
      rubricId: "ID Rubric",
      rubricIdPlaceholder: "Chọn rubric...",
      rubricOverride: "Ghi đè Rubric",
      rubricOverridePlaceholder: "Prompt cụ thể cho LLM Judge",
      threshold: "Ngưỡng vượt qua (0-1)",
      weight: "Trọng số",
      severity: "Mức độ nghiêm trọng",
      enabled: "Trạng thái bật",
      scoringTitle: "Mức độ ưu tiên và điểm",
      currentSummary: "Tóm tắt hiện tại",
      validation: {
        maxComponentLength: "Không vượt quá 100 ký tự",
        maxPathLength: "Không vượt quá 500 ký tự",
        minThreshold: "Tối thiểu là 0",
        maxThreshold: "Tối đa là 1",
        minWeight: "Phải lớn hơn 0",
        minOrder: "Tối thiểu là 0",
        maxOrder: "Không vượt quá 1000000",
        fieldPathRequired: "Đường dẫn trường là bắt buộc khi chọn phạm vi FIELD",
        componentRequired: "Thành phần mục tiêu là bắt buộc khi chọn phạm vi COMPONENT",
        fieldPathsRequired: "Cần ít nhất một đường dẫn khi chọn phạm vi MULTI_FIELD",
        expectedValueRequired: "Cần nhập giá trị kỳ vọng cho điều kiện này",
        expectedNumberRequired: "Vui lòng nhập một số hợp lệ",
        rangeRequired: "Cần nhập cả giá trị nhỏ nhất và lớn nhất",
        rangeOrder: "Giá trị nhỏ nhất phải nhỏ hơn hoặc bằng giá trị lớn nhất",
        invalidJson: "JSON không hợp lệ",
        rubricRequired: "Cần chọn Tiêu chí hoặc điền nội dung Ghi đè cho loại LLM Rubric"
      },
      messages: {
        created: "Đã tạo xác thực",
        createFailed: "Lỗi tạo xác thực",
        updated: "Đã cập nhật xác thực",
        updateFailed: "Lỗi cập nhật xác thực",
        deleted: "Đã xóa xác thực",
        deleteFailed: "Lỗi xóa xác thực",
        unsavedChanges: "Bạn có thay đổi chưa lưu. Vẫn đóng?"
      }
    }
  },
  toolexpectations: {
    title: "Tool Expectation",
    addExpectation: "Thêm Tool Expectation",
    emptyDesc: "Chưa cấu hình Tool Expectation nào cho kịch bản này.",
    disabled: "Đã tắt",
    types: {
      TOOL_MUST_BE_CALLED: "Phải gọi công cụ",
      TOOL_MUST_NOT_BE_CALLED: "Không được gọi công cụ",
      TOOL_ARGS_MATCH: "Đối số công cụ khớp",
      TOOL_SEQUENCE_MATCH: "Chuỗi công cụ khớp",
      TOOL_CALL_COUNT: "Số lần gọi công cụ",
      TOOL_OUTPUT_USED_IN_ANSWER: "Kết quả công cụ dùng trong câu trả lời",
      AGENT_EQUALS: "Agent khớp",
      AGENT_NOT_EQUALS: "Agent không khớp",
      AGENT_STEP_CONTAINS: "Bước của Agent có chứa"
    },
    delete: {
      title: "Xóa kỳ vọng",
      desc: "Bạn có chắc chắn muốn xóa kỳ vọng công cụ này không?",
      deleting: "Đang xóa..."
    },
    form: {
      createTitle: "Tạo kỳ vọng",
      editTitle: "Sửa kỳ vọng",
      createDesc: "Thêm quy tắc kỳ vọng công cụ hoặc Agent.",
      editDesc: "Chỉnh sửa quy tắc kỳ vọng.",
      expectationType: "Loại kỳ vọng",
      targetSource: "Nguồn mục tiêu",
      toolName: "Tên công cụ",
      toolNamePlaceholder: "VD: search_product",
      agentName: "Tên Agent",
      agentNamePlaceholder: "VD: product_search_agent",
      argumentAssertions: "Kiểm tra đối số (JSON Array)",
      formatJson: "Định dạng JSON",
      sequence: "Chuỗi (ngăn cách bằng dấu phẩy)",
      sequencePlaceholder: "toolA, toolB, toolC",
      sequenceHint: "Liệt kê chính xác chuỗi các công cụ dự kiến sẽ được gọi.",
      minCalls: "Số lần gọi tối thiểu",
      maxCalls: "Số lần gọi tối đa",
      severity: "Mức độ nghiêm trọng",
      required: "Bắt buộc",
      enabled: "Trạng thái bật",
      validation: {
        maxLength: "Không vượt quá {{max}} ký tự",
        invalidJsonArray: "Phải là mảng JSON hợp lệ chứa các object",
        minCalls: "Phải lớn hơn hoặc bằng 0",
        maxCalls: "Phải lớn hơn hoặc bằng 0",
        minOrder: "Tối thiểu là 0",
        maxOrder: "Không vượt quá 1000000"
      },
      messages: {
        created: "Đã tạo kỳ vọng",
        createFailed: "Lỗi tạo kỳ vọng",
        updated: "Đã cập nhật kỳ vọng",
        updateFailed: "Lỗi cập nhật kỳ vọng",
        deleted: "Đã xóa kỳ vọng",
        deleteFailed: "Lỗi xóa kỳ vọng",
        unsavedChanges: "Bạn có thay đổi chưa lưu. Vẫn đóng?"
      }
    }
  },
  report: {
    assertion: "Assertion",
    assertionReasonFallback: "Runner chưa trả lý do chi tiết.",
    expectedCondition: "Điều kiện kỳ vọng",
    expected: "Kỳ vọng",
    actual: "Thực tế",
  },
};
