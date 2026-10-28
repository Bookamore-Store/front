export const migrateLanguage = () => {
  const storedLanguage = localStorage.getItem('i18nextLng');

  if (!storedLanguage) return;

  const supportedLanguages = ['en', 'uk'];

  if (supportedLanguages.includes(storedLanguage)) {
    const existingCookie = document.cookie
      .split('; ')
      .some((cookie) => cookie.startsWith('i18next='));

    if (!existingCookie) {
      document.cookie = `i18next=${storedLanguage}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }

  localStorage.removeItem('i18nextLng');
};
