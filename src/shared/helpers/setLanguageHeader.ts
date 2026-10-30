import i18next from 'i18next';

export const setLanguageHeader = (headers: Headers): Headers => {
  const language = i18next.resolvedLanguage || i18next.language || 'en';
  headers.set('Accept-Language', language.startsWith('uk') ? 'uk' : 'en');
  return headers;
};
