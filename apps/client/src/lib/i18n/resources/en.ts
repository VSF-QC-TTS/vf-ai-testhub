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
      deleteConfirm: "Are you sure you want to delete this item? This action cannot be undone."
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
    },
    switcher: {
      select: "Select Project",
      title: "Projects",
      create: "Create Project",
      manage: "Manage Projects",
    },
  },
  targets: {
    title: "Targets",
  },
  datasets: {
    title: "Datasets",
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
  },
  status: {
    active: "Active",
    inactive: "Inactive",
  },
};
