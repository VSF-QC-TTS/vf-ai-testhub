import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en } from "./resources/en";
import { vi } from "./resources/vi";

const LANGUAGE_KEY = "vf_language";

const getInitialLanguage = () => {
  const saved = localStorage.getItem(LANGUAGE_KEY);
  if (saved && (saved === "en" || saved === "vi")) {
    return saved;
  }
  return "en";
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en,
      vi,
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

export default i18n;
