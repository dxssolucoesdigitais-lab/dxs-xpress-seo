import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

i18n
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: ['pt', 'en', 'es'],
    fallbackLng: 'pt',
    debug: true, // Alterado para true para depuração
    interpolation: {
      escapeValue: false, // React already protects from XSS
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
  });

export default i18n;