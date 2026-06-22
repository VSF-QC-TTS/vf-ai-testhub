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
    description: "Description",
    roles: {
      QC_MEMBER: "Member",
      QC_LEAD: "Lead",
      QC_MANAGER: "Manager",
      ADMIN: "Administrator",
      USER: "User"
    }
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
        }
      },
      metrics: {
        totalTestCases: "Total Test Cases",
        activeTargets: "Active Targets",
        datasets: "Datasets",
        rubrics: "Rubrics"
      },
      recentRuns: "Recent Runs",
      recentRunsUnavailable: "Recent runs overview will be available when backend supports project-level aggregation.",
      viewAllRuns: "View All Runs",
      configSummary: "Configuration",
      targetsConfigured: "Targets Configured",
      datasetsImported: "Datasets Imported",
      rubricsDefined: "Rubrics Defined"
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
    import: {
      title: "Import Test Cases",
      uploadDesc: "Upload a CSV, XLS, or XLSX file to import test cases.",
      previewDesc: "Review the detected columns and map them to standard fields.",
      resultDesc: "Import process complete.",
      clickToSelect: "Click to select a file",
      supportedFiles: "Supported formats: .csv, .xls, .xlsx",
      selectFile: "Select File",
      preview: "Preview",
      uploading: "Uploading...",
      previewFailed: "Failed to upload file for preview",
      totalRows: "Total Rows",
      columnsDetected: "Columns Detected",
      mappedFields: "Mapped Fields",
      duplicates: "Duplicates",
      columnMapping: "Column Mapping",
      fileColumn: "File Column",
      mapToField: "Map to Field",
      dataPreview: "Data Preview",
      defaultTags: "Default Tags",
      skipDuplicates: "Skip duplicate external IDs",
      confirmImport: "Confirm Import",
      importing: "Importing...",
      confirmFailed: "Failed to confirm import",
      success: "Import successful",
      inputRequired: "Input field must be mapped to a column",
      importComplete: "Import Complete",
      importCompleteWithErrors: "Import Complete with Errors",
      imported: "Imported",
      skipped: "Skipped",
      errors: "Errors",
      errorDetails: "Error Details",
      row: "Row",
      reason: "Reason"
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
      step3Title: "Create Dataset",
      step3Desc: "Give your new dataset a name so we can save these tests.",
      step3Placeholder: "e.g., Auth Regression Tests",
      submit: "Import & Create",
      importing: "Importing...",
      success: "Successfully imported test cases."
    }
  },
  rubrics: {
    title: "Evaluation Rubrics",
    description: "Manage instructions for the LLM Judge to evaluate your test cases.",
    create: "Create Rubric",
    edit: "Edit Rubric",
    searchPlaceholder: "Search rubrics...",
    empty: {
      title: "No rubrics found",
      description: "You haven't created any evaluation rubrics yet."
    },
    fields: {
      name: "Name",
      category: "Category",
      scope: "Scope",
      language: "Language",
      content: "Instructions (Prompt)",
      threshold: "Pass Threshold"
    },
    categories: {
      ANSWER_QUALITY: "Answer Quality",
      POLICY_COMPLIANCE: "Policy Compliance",
      NO_HALLUCINATION: "No Hallucination",
      SAFETY_REFUSAL: "Safety Refusal",
      RAG_FAITHFULNESS: "Faithfulness (RAG)",
      TOOL_OUTPUT_USAGE: "Tool Output Usage",
      SUGGESTION_RELEVANCE: "Suggestion Relevance",
      VIETNAMESE_TONE: "Vietnamese Tone",
      CLARIFYING_QUESTION: "Clarifying Question",
      BUSINESS_ACCEPTANCE: "Business Acceptance"
    },
    form: {
      createTitle: "Create New Rubric",
      createDesc: "Define instructions for the LLM judge.",
      editTitle: "Edit Rubric",
      editDesc: "Update rubric instructions.",
      name: "Name",
      namePlaceholder: "e.g., Tone and Politeness",
      description: "Description",
      descPlaceholder: "Optional brief description",
      category: "Category",
      categoryPlaceholder: "Select a category...",
      language: "Language",
      threshold: "Pass Threshold",
      content: "Instructions (Prompt)",
      contentPlaceholder: "e.g., The response must be polite and use professional language...",
      messages: {
        created: "Rubric created successfully",
        updated: "Rubric updated successfully",
        createFailed: "Failed to create rubric",
        updateFailed: "Failed to update rubric"
      }
    },
    delete: {
      title: "Delete Rubric",
      desc: "Are you sure you want to delete this rubric? Tests using it will fall back to their defaults.",
      confirm: "Delete",
      deleting: "Deleting..."
    },
    archive: {
      title: "Archive Rubric",
      desc: "Are you sure you want to archive this rubric? It will no longer be available for new evaluations.",
      confirm: "Archive",
      archiving: "Archiving..."
    }
  },
  ai: {
    generateTitle: "Generate Test Cases",
    generateDesc: "Use AI to automatically draft test cases based on your feature requirements.",
    featureName: "Feature Name",
    featureNamePlaceholder: "e.g., Forgot Password Flow",
    businessRequirement: "Business Requirements",
    businessRequirementPlaceholder: "Describe how the feature should behave, inputs, outputs, and edge cases...",
    generateBtn: "Generate Drafts",
    generating: "Analyzing requirements...",
    reviewTitle: "Review Drafts",
    discardAll: "Discard All",
    saveSelected: "Save Selected",
    noDrafts: "No drafts could be generated. Try adjusting your requirements."
  },
  testCases: {
    title: "Test Cases",
  },
  runs: {
    title: "Runs",
    history: {
      title: "Run History",
      description: "View the history of test executions for this dataset.",
      noRuns: "No Runs Found",
      noRunsDesc: "There are no test runs available yet.",
      runId: "Run ID",
      status: "Status",
      mode: "Mode",
      cases: "Total Cases",
      passed: "Passed",
      failed: "Failed",
      date: "Date",
      viewReport: "View Report"
    },
    status: {
      COMPLETED: "Completed",
      FAILED: "Failed",
      CANCELLED: "Cancelled",
      RUNNING: "Running",
      PENDING: "Pending",
      UNCERTAIN: "Uncertain",
      ERROR: "Error"
    },
    modes: {
      FULL: "Full",
      SMOKE: "Smoke"
    }
  },
  reports: {
    title: "Reports",
  },
  experiments: {
    title: "A/B Experiments",
    empty: {
      title: "No experiments yet",
      description: "Start an A/B experiment to compare different targets, models, or configurations."
    },
    create: "Create Experiment",
    fields: {
      name: "Experiment Name",
      status: "Status",
      createdAt: "Created At"
    },
    form: {
      createTitle: "Create A/B Experiment",
      createDesc: "Define variants to compare performance.",
      name: "Name",
      namePlaceholder: "e.g. Prompt Optimization Test",
      datasetId: "Dataset",
      datasetIdPlaceholder: "Select dataset...",
      variants: "Variants",
      addVariant: "Add Variant",
      variantName: "Variant Name",
      variantNamePlaceholder: "e.g. Base, Candidate",
      targetId: "Target",
      targetIdPlaceholder: "Select target...",
      startDesc: "Estimated calls: {{calls}}. Proceed?",
      startBtn: "Start Experiment",
      starting: "Starting..."
    },
    detail: {
      progress: "Progress",
      winner: "Recommendation / Winner",
      noWinnerYet: "Waiting for results to determine a winner.",
    }
  },
  compare: {
    title: "Run Compare",
    selectRuns: "Select Runs to Compare",
    baseRun: "Base Run",
    candidateRun: "Candidate Run",
    compareBtn: "Compare",
    metrics: {
      regressions: "Regressions",
      fixes: "Fixes",
      unchanged: "Unchanged",
      passRateDelta: "Pass Rate Delta",
      latencyDelta: "Latency Delta",
      costDelta: "Cost Delta"
    },
    diff: {
      expected: "Expected",
      actualBase: "Actual (Base)",
      actualCandidate: "Actual (Candidate)"
    },
    incompatible: "Runs are incompatible. They must use the same dataset."
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
  assertions: {
    title: "Assertions",
    addAssertion: "Add Assertion",
    emptyDesc: "No assertions configured for this test case.",
    disabled: "Disabled",
    delete: {
      title: "Delete Assertion",
      desc: "Are you sure you want to delete this assertion?",
      deleting: "Deleting..."
    },
    form: {
      createTitle: "Create Assertion",
      editTitle: "Edit Assertion",
      createDesc: "Add a verification rule.",
      editDesc: "Modify the verification rule.",
      scope: "Scope",
      type: "Type",
      targetComponent: "Target Component",
      targetComponentPlaceholder: "e.g. answer",
      fieldPath: "Field Path",
      fieldPathPlaceholder: "e.g. $.data.id",
      fieldPathHint: "JSONPath expression to select a specific field.",
      fieldPaths: "Field Paths (comma separated)",
      fieldPathsPlaceholder: "$.data.id, $.data.name",
      expectedValue: "Expected Value",
      expectedValuePlaceholder: "Text or JSON string",
      formatJson: "Format JSON",
      rubricId: "Rubric ID",
      rubricIdPlaceholder: "Select a rubric...",
      rubricOverride: "Rubric Override",
      rubricOverridePlaceholder: "Specific instructions for LLM judge",
      threshold: "Pass Threshold (0-1)",
      weight: "Weight",
      severity: "Severity",
      enabled: "Enabled",
      validation: {
        maxComponentLength: "Must not exceed 100 characters",
        maxPathLength: "Must not exceed 500 characters",
        minThreshold: "Must be at least 0",
        maxThreshold: "Must not exceed 1",
        minWeight: "Must be positive",
        minOrder: "Must be at least 0",
        maxOrder: "Must not exceed 1000000",
        fieldPathRequired: "Field Path is required when Scope is FIELD",
        rubricRequired: "Rubric ID or Override is required for LLM Rubric type"
      },
      messages: {
        created: "Assertion created",
        createFailed: "Failed to create assertion",
        updated: "Assertion updated",
        updateFailed: "Failed to update assertion",
        deleted: "Assertion deleted",
        deleteFailed: "Failed to delete assertion",
        unsavedChanges: "You have unsaved changes. Close anyway?"
      }
    }
  },
  toolexpectations: {
    title: "Tool Expectations",
    addExpectation: "Add Expectation",
    emptyDesc: "No tool expectations configured for this test case.",
    disabled: "Disabled",
    types: {
      TOOL_MUST_BE_CALLED: "Tool Must Be Called",
      TOOL_MUST_NOT_BE_CALLED: "Tool Must Not Be Called",
      TOOL_ARGS_MATCH: "Tool Args Match",
      TOOL_SEQUENCE_MATCH: "Tool Sequence Match",
      TOOL_CALL_COUNT: "Tool Call Count",
      TOOL_OUTPUT_USED_IN_ANSWER: "Tool Output Used in Answer",
      AGENT_EQUALS: "Agent Equals",
      AGENT_NOT_EQUALS: "Agent Not Equals",
      AGENT_STEP_CONTAINS: "Agent Step Contains"
    },
    delete: {
      title: "Delete Expectation",
      desc: "Are you sure you want to delete this tool expectation?",
      deleting: "Deleting..."
    },
    form: {
      createTitle: "Create Expectation",
      editTitle: "Edit Expectation",
      createDesc: "Add a tool or agent expectation.",
      editDesc: "Modify the tool or agent expectation.",
      expectationType: "Expectation Type",
      targetSource: "Target Source",
      toolName: "Tool Name",
      toolNamePlaceholder: "e.g. search_product",
      agentName: "Agent Name",
      agentNamePlaceholder: "e.g. product_search_agent",
      argumentAssertions: "Argument Assertions (JSON Array)",
      formatJson: "Format JSON",
      sequence: "Sequence (comma separated)",
      sequencePlaceholder: "toolA, toolB, toolC",
      sequenceHint: "List the exact sequence of tools expected to be called.",
      minCalls: "Minimum Calls",
      maxCalls: "Maximum Calls",
      severity: "Severity",
      required: "Required",
      enabled: "Enabled",
      validation: {
        maxLength: "Must not exceed {{max}} characters",
        invalidJsonArray: "Must be a valid JSON array of objects",
        minCalls: "Must be at least 0",
        maxCalls: "Must be at least 0",
        minOrder: "Must be at least 0",
        maxOrder: "Must not exceed 1000000"
      },
      messages: {
        created: "Expectation created",
        createFailed: "Failed to create expectation",
        updated: "Expectation updated",
        updateFailed: "Failed to update expectation",
        deleted: "Expectation deleted",
        deleteFailed: "Failed to delete expectation",
        unsavedChanges: "You have unsaved changes. Close anyway?"
      }
    }
  },
};