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
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
  }, (err, t) => {
    if (err) {
      console.error("i18next initialization error:", err);
    } else {
      console.log("i18next initialized successfully.");
      // Explicitly load the current language to trigger backend load
      i18n.loadLanguages(i18n.language, (loadErr) => {
        if (loadErr) {
          console.error(`i18next: Error loading initial language (${i18n.language}):`, loadErr);
        } else {
          console.log(`i18next: Successfully loaded initial language: ${i18n.language}`);
        }
      });
    }
  });

// Add a listener for when resources are loaded
i18n.on('loaded', (loaded) => {
  console.log('i18next: Resources loaded:', loaded);
});

i18n.on('failedLoading', (lng, ns, msg) => {
  console.error(`i18next: Failed to load ${ns} for ${lng}:`, msg);
});

export default i18n;