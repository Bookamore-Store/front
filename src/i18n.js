import { migrateLanguage } from '@/shared/helpers/migrateLanguage';

import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import ICU from 'i18next-icu';

migrateLanguage();

export default i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(ICU)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'uk'],
    debug: false,

    detection: {
      order: ['cookie', 'navigator'],
      lookupCookie: 'i18next',
      caches: ['cookie'],
      cookieMinutes: 60 * 24 * 365,
      cookieOptions: {
        path: '/',
        sameSite: 'lax',
      },
    },

    interpolation: {
      escapeValue: false,
    },

    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
  });
