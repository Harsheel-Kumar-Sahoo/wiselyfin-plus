import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import bn from "./locales/bn.json";
import en from "./locales/en.json";
import hi from "./locales/hi.json";
import { LANGUAGE_KEY, isLanguageCode, type LanguageCode } from "./languages";
import ta from "./locales/ta.json";
import te from "./locales/te.json";

function getInitialLanguage(): LanguageCode {
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    if (isLanguageCode(saved)) return saved;
  } catch {
    // Storage can be blocked; fall back to English.
  }
  return "en";
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    ta: { translation: ta },
    te: { translation: te },
    bn: { translation: bn },
  },
  lng: getInitialLanguage(),
  fallbackLng: "en",
  // React already escapes text, so values are never inserted as raw HTML.
  interpolation: { escapeValue: false },
});

document.documentElement.lang = i18n.language;

export function changeLanguage(code: LanguageCode) {
  void i18n.changeLanguage(code);
  document.documentElement.lang = code;
  try {
    localStorage.setItem(LANGUAGE_KEY, code);
  } catch {
    // Ignore: the language still changes for this visit.
  }
}

export default i18n;