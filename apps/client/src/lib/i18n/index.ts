import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { zodVi } from "./resources/zod-vi";
import { en } from "./resources/en";
import { vi } from "./resources/vi";

const LANGUAGE_KEY = "vf_language";

const getInitialLanguage = () => {
  const saved = localStorage.getItem(LANGUAGE_KEY);
  if (saved && (saved === "en" || saved === "vi")) {
    return saved;
  }
  return "vi";
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en,
        auth: en.auth,
        api: en.api,
        zod: {
          errors: {
            invalid_string: { email: "Invalid email address" },
            too_small: { string: { inclusive: "Must contain at least {{minimum}} character(s)" } },
            invalid_type_received_undefined: "Required"
          }
        },
      },
      vi: {
        translation: vi,
        auth: vi.auth,
        api: vi.api,
        zod: zodVi,
      },
    },
    lng: getInitialLanguage(),
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

i18n.on("languageChanged", (lng) => {
  localStorage.setItem(LANGUAGE_KEY, lng);
  document.documentElement.lang = lng;
});

// Set initial document language
document.documentElement.lang = i18n.language;

// Set initial document language
document.documentElement.lang = i18n.language;

export default i18n;
