import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { LANGUAGE_KEY, isLanguageCode, type LanguageCode } from "./languages";
import bn from "./locales/bn.json";
import bnBudget from "./locales/budget/bn.json";
import enBudget from "./locales/budget/en.json";
import hiBudget from "./locales/budget/hi.json";
import taBudget from "./locales/budget/ta.json";
import teBudget from "./locales/budget/te.json";
import bnEngage from "./locales/engage/bn.json";
import enEngage from "./locales/engage/en.json";
import hiEngage from "./locales/engage/hi.json";
import taEngage from "./locales/engage/ta.json";
import teEngage from "./locales/engage/te.json";
import en from "./locales/en.json";
import hi from "./locales/hi.json";
import bnLearn from "./locales/learn/bn.json";
import enLearn from "./locales/learn/en.json";
import hiLearn from "./locales/learn/hi.json";
import taLearn from "./locales/learn/ta.json";
import teLearn from "./locales/learn/te.json";
import bnStocks from "./locales/stocks/bn.json";
import enStocks from "./locales/stocks/en.json";
import hiStocks from "./locales/stocks/hi.json";
import taStocks from "./locales/stocks/ta.json";
import teStocks from "./locales/stocks/te.json";
import ta from "./locales/ta.json";
import te from "./locales/te.json";
import bnTools from "./locales/tools/bn.json";
import enTools from "./locales/tools/en.json";
import hiTools from "./locales/tools/hi.json";
import taTools from "./locales/tools/ta.json";
import teTools from "./locales/tools/te.json";
import bnTutor from "./locales/tutor/bn.json";
import enTutor from "./locales/tutor/en.json";
import hiTutor from "./locales/tutor/hi.json";
import taTutor from "./locales/tutor/ta.json";
import teTutor from "./locales/tutor/te.json";
import bnWallet from "./locales/wallet/bn.json";
import enWallet from "./locales/wallet/en.json";
import hiWallet from "./locales/wallet/hi.json";
import taWallet from "./locales/wallet/ta.json";
import teWallet from "./locales/wallet/te.json";

function getInitialLanguage(): LanguageCode {
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    if (isLanguageCode(saved)) return saved;
  } catch {
    // Storage can be blocked; fall back to English.
  }
  return "en";
}

// Each language is the main file joined with the extra files for newer screens.
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: { ...en, ...enLearn, ...enWallet, ...enEngage, ...enTools, ...enBudget, ...enStocks, ...enTutor } },
    hi: { translation: { ...hi, ...hiLearn, ...hiWallet, ...hiEngage, ...hiTools, ...hiBudget, ...hiStocks, ...hiTutor } },
    ta: { translation: { ...ta, ...taLearn, ...taWallet, ...taEngage, ...taTools, ...taBudget, ...taStocks, ...taTutor } },
    te: { translation: { ...te, ...teLearn, ...teWallet, ...teEngage, ...teTools, ...teBudget, ...teStocks, ...teTutor } },
    bn: { translation: { ...bn, ...bnLearn, ...bnWallet, ...bnEngage, ...bnTools, ...bnBudget, ...bnStocks, ...bnTutor } },
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