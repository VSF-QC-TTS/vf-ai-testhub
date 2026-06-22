export const en = {
  api: {
    BAD_CREDENTIALS: "Invalid email or password.",
    EMAIL_ALREADY_EXISTS: "This email is already in use.",
    USERNAME_ALREADY_EXISTS: "This username is already taken.",
    VALIDATION_ERROR: "Invalid input data. Please check your entries.",
    USER_NOT_FOUND: "Account not found.",
    INVALID_ACCESS_TOKEN: "Invalid session token.",
    INVALID_REFRESH_TOKEN: "Session expired. Please log in again.",
    ACCOUNT_LOCKED: "Your account has been locked.",
    EMAIL_NOT_VERIFIED: "Please verify your email address.",
    WRONG_PASSWORD: "Current password is incorrect.",
    INTERNAL_SERVER_ERROR: "An unexpected error occurred. Please try again.",
    UNAUTHORIZED: "You must be logged in to perform this action.",
    PROJECT_NOT_FOUND: "The requested project could not be found.",
    TARGET_NOT_FOUND: "The requested target could not be found.",
  },
  common: {
    language: "Language",
    english: "English",
    vietnamese: "Vietnamese",
    loading: "Loading...",
    home: "Home",
    settings: "Settings",
    navigation: {
      toggleMenu: "Toggle menu",
      menu: "Navigation menu",
      toggleLanguage: "Toggle language",
      toggleUserMenu: "Toggle user menu",
      myAccount: "My Account",
      profile: "Profile",
      settings: "Settings",
      logout: "Logout",
    },
    comingSoon: {
      title: "Feature coming soon",
      desc: "This page is under construction.",
    },
    validation: {
      required: "This field is required",
      invalidEmail: "Invalid email address",
      invalidUrl: "Invalid URL",
      invalidId: "Invalid UUID format",
      maxLength: "Must be at most {{max}} characters",
      minLength: "Must be at least {{min}} characters",
      min: "Must be at least {{min}}",
      max: "Must be at most {{max}}"
    },
    actions: {
      cancel: "Cancel",
      save: "Save",
      saveChanges: "Save Changes",
      edit: "Edit",
      deleteConfirm: "Are you sure you want to delete this item? This action cannot be undone."
    },
    optional: "Optional",
    description: "Description"
  },
  home: {
    title: "AI TestHub",
    totalProjects: "Total Projects",
    noProjects: {
      title: "No projects created",
      description: "You don't have any projects yet. Create one to get started."
    }
  },
  auth: {
    hero: {
      headline: "Quality\nControl.",
      slogan: "Unify your test cases, automate regression, and deploy with absolute confidence.",
      liveExecution: "Live Execution",
      privacy: "Privacy",
      terms: "Terms",
      logs: {
        auth: "Authenticating API tokens...",
        regression: "Running regression suite #402",
        validate: "Validating checkout endpoints",
        evaluate: "Evaluating LLM responses"
      }
    },
    login: {
      title: "Welcome back",
      description: "Sign in to your account to continue",
      email: "Email",
      password: "Password",
      forgotPassword: "Forgot password?",
      error: "Failed to sign in",
      submit: "Sign in",
      orContinueWith: "Or continue with",
      noAccount: "Don't have an account? ",
      register: "Sign up",
      oauth: {
        github: "GitHub",
        google: "Google"
      }
    },
    register: {
      title: "Create an account",
      description: "Enter your details to get started",
      displayName: "Display Name",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      passwordsDoNotMatch: "Passwords do not match.",
      error: "Registration failed",
      submit: "Create account",
      hasAccount: "Already have an account? ",
      login: "Sign in",
      oauth: {
        github: "GitHub",
        google: "Google"
      }
    },
    forgotPassword: {
      title: "Reset password",
      description: "Enter your email address and we'll send you a link to reset your password.",
      email: "Email",
      error: "Failed to send reset link",
      submit: "Send reset link",
      successTitle: "Check your email",
      successDesc: "If an account exists with that email, we have sent a password reset link.",
      backToLogin: "Back to login"
    },
    logout: "Logout",
  },
  projects: {
    title: "Projects",
    new: "New Project",
    empty: {
      title: "No projects yet",
      desc: "Create your first project to start configuring APIs and running tests.",
      cta: "Create new project",
    },
    gate: {
      errorTitle: "Projects could not be loaded",
      errorDesc: "Refresh the page or open project management to recover your workspace.",
      staleTitle: "Project not found",
      staleDesc: "The project in this URL no longer exists or you no longer have access to it.",
      manageCta: "Review projects",
    },
    create: {
      back: "Back to projects",
      title: "Create your first project",
      desc: "Projects group targets, datasets, runs, and reports into one working context.",
      submit: "Create project",
    },
    overview: {
      eyebrow: "Project workspace",
      createTarget: "Create target",
      manageTargets: "Manage targets",
      targetCount_one: "{{count}} target",
      targetCount_other: "{{count}} targets",
      notConfigured: "Not configured",
      settings: "Project Settings",
      resources: "Project Resources",
      setup: {
        target: {
          title: "Configure your first Target",
          description: "Start by connecting an API endpoint or environment that you want to evaluate."
        },
        dataset: {
          title: "Import a Dataset",
          description: "You have a target ready. Now import test cases or a dataset to run against it.",
          action: "Import Dataset"
        },
        run: {
          title: "Start your first Run",
          description: "Your environment and data are ready. Execute the tests to see the results.",
          action: "Run Dataset"
        },
        dashboard: {
          title: "Dashboard metrics placeholder",
          description: "Once runs exist, this area will show top metric cards, pass-rate trends, and recent runs."
        }
      }
    },
    list: {
      desc: "Manage your workspaces and API testing environments.",
      noDescription: "No description provided.",
      createdAt: "Created {{date}}",
      search: "Search projects...",
      create: "Create project",
      columns: {
        name: "Project Name",
        createdAt: "Created At",
        actions: "Actions",
      },
    },
    form: {
      createTitle: "Create a new project",
      createDesc: "Enter the basic information for your project.",
      editTitle: "Edit project",
      name: "Project Name",
      namePlaceholder: "e.g. Analytics Engine",
      description: "Description",
      descPlaceholder: "Optional details...",
      cancel: "Cancel",
      submit: "Save",
      creating: "Creating...",
      updating: "Updating...",
    },
    delete: {
      title: "Delete project",
      desc: "Are you sure you want to delete this project? This action cannot be undone.",
      confirm: "Delete",
      cancel: "Cancel",
      archiving: "Deleting...",
    },
    switcher: {
      select: "Select Project",
      current: "Current project",
      title: "Projects",
      create: "Create Project",
      manage: "Manage Projects",
    },
  },
  targets: {
    title: "Targets",
    missingProject: "Select a project before managing targets.",
    notFound: "The requested target could not be found.",
    description: "Configure APIs and environments to be evaluated.",
    create: "Create Target",
    edit: "Edit Target",
    empty: {
      title: "No Targets Yet",
      description: "Set up your first API target to begin evaluating prompts and testing endpoints."
    },
    searchPlaceholder: "Search targets...",
    noUrl: "No URL",
    primary: "Primary",
    delete: {
      title: "Delete target",
      desc: "This target will be removed from the current project. Existing run history is not changed.",
      confirm: "Delete",
      deleting: "Deleting...",
    },
    workbench: {
      createTitle: "Create Target",
      editTitle: "Edit Target",
      createDesc: "Set up a new API target.",
      quickImport: {
        title: "Quick Import (cURL)",
        placeholder: "Paste your cURL command here to auto-fill the configuration below...",
        parse: "Parse",
        parsing: "Parsing..."
      },
      httpConfig: {
        title: "HTTP Configuration",
        method: "Method",
        url: "URL",
        urlPlaceholder: "https://api.example.com/v1/chat",
        headers: "Headers",
        body: "Body (JSON)",
        auth: "Authentication",
        headersDesc: "Define custom HTTP headers. Use {{variable}} syntax for dynamic values.",
        bodyDesc: "Define the request body payload template.",
        authDesc: "Authentication forms will be rendered here based on auth type."
      },
      responseMapping: {
        title: "Response Mapping",
        desc: "Map fields from your API's JSON response to standard Evaluation metrics using JSONPath expressions.",
        answerPath: "Answer Path",
        answerPathPlaceholder: "e.g. data.choices[0].message.content",
        sourcesPath: "Sources/Citations Path",
        sourcesPathPlaceholder: "e.g. data.metadata.citations",
        latencyPath: "Latency Path",
        latencyPathPlaceholder: "e.g. metrics.total_time_ms",
        missingFieldBehavior: "Missing Field Behavior",
        fail: "FAIL (Mark test as error)",
        skip: "SKIP (Ignore missing fields)",
        warning: "WARNING (Log warning)"
      },
      settings: {
        title: "General settings",
        name: "Target Name *",
        namePlaceholder: "e.g. Production RAG API",
        environment: "Environment",
        envDev: "Development (dev)",
        envStaging: "Staging (staging)",
        envProd: "Production (prod)",
        timeout: "Timeout (ms)",
        testConnection: "Test Connection"
      }
    }
  },
  datasets: {
    title: "Datasets",
    description: "Manage datasets and test cases for evaluation.",
    missingProject: "Select a project before managing datasets.",
    create: "Create Dataset",
    empty: {
      title: "No Datasets Yet",
      description: "Import test cases or create a new dataset to start building your evaluation suite."
    },
    emptySearch: "No datasets found matching your search.",
    searchPlaceholder: "Search datasets...",
    fields: {
      name: "Dataset Name",
      category: "Category",
      tags: "Tags",
      testCaseCount: "Cases",
      updatedAt: "Updated At"
    },
    form: {
      createTitle: "Create Dataset",
      editTitle: "Edit Dataset",
      createDesc: "Group your test cases into manageable datasets.",
      name: "Name *",
      namePlaceholder: "e.g. Helpdesk QA Set",
      category: "Category",
      categoryPlaceholder: "e.g. Classification",
      description: "Description",
      descPlaceholder: "Describe the purpose of this dataset..."
    },
    delete: {
      title: "Delete dataset",
      desc: "Are you sure you want to delete this dataset? This will also remove all associated test cases.",
      confirm: "Delete",
      deleting: "Deleting..."
    }
  },
  testCases: {
    title: "Test Cases",
  },
  runs: {
    title: "Runs",
  },
  reports: {
    title: "Reports",
  },
  rubrics: {
    title: "Rubrics",
  },
  errors: {
    unknown: "Unknown Error",
    boundaryTitle: "Oops!",
    boundaryDesc: "Sorry, an unexpected error has occurred.",
  },
  status: {
    active: "Active",
    inactive: "Inactive",
  },
  testcases: {
    title: "Test Cases",
    description: "Manage test cases for this dataset.",
    missingDatasetId: "Missing dataset ID",
    noTestCases: "No Test Cases Yet",
    noTestCasesDesc: "Start by adding a test case or importing from a file.",
    addTestCase: "Add Test Case",
    searchPlaceholder: "Search cases...",
    allPriorities: "All Priorities",
    allStates: "All States",
    enabled: "Enabled",
    disabled: "Disabled",
    sectionPlaceholder: "Section...",
    tagPlaceholder: "Tag...",
    noMatches: "No test cases match your filters.",
    columns: {
      extId: "Ext ID",
      section: "Section",
      input: "Input",
      expected: "Expected",
      tags: "Tags",
      priority: "Priority",
      status: "Status"
    },
    noInput: "No input",
    delete: {
      title: "Delete Test Case",
      desc: "Are you sure you want to delete this test case? This action cannot be undone.",
      deleting: "Deleting..."
    },
    form: {
      createTitle: "Create Test Case",
      editTitle: "Edit Test Case",
      createDesc: "Add a new test case to the dataset.",
      editDesc: "Modify the properties of this test case.",
      externalId: "External ID",
      externalIdPlaceholder: "e.g. TC001",
      section: "Section",
      sectionPlaceholder: "e.g. Authentication",
      name: "Name",
      namePlaceholder: "Short human-readable name",
      input: "Input *",
      inputPlaceholder: "User input sent to the chatbot",
      expectedBehavior: "Expected Behavior",
      expectedBehaviorPlaceholder: "Expected chatbot behavior",
      referenceAnswer: "Reference Answer",
      referenceAnswerPlaceholder: "Reference answer for evaluators",
      variables: "Variables (JSON)",
      formatValidate: "Format / Validate",
      tags: "Tags (comma separated)",
      tagsPlaceholder: "tag1, tag2",
      priority: "Priority",
      status: "Enabled",
      validation: {
        inputRequired: "Input is required",
        invalidJson: "Invalid JSON",
        maxLength: "Must not exceed {{max}} characters",
        minOrder: "Must be at least 0",
        maxOrder: "Must not exceed 1000000"
      },
      messages: {
        created: "Test case created",
        createFailed: "Failed to create test case",
        updated: "Test case updated",
        updateFailed: "Failed to update test case",
        deleted: "Test case deleted",
        deleteFailed: "Failed to delete test case",
        unsavedChanges: "You have unsaved changes. Are you sure you want to close?"
      }
    }
  },
};