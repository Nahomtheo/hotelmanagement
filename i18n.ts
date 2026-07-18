import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
  // 1. Await the active locale promise
  let locale = await requestLocale;

  // 2. Fallback in case the locale is undefined or unsupported
  const supportedLocales = ['en', 'am'];
  if (!locale || !supportedLocales.includes(locale)) {
    locale = 'en';
  }

  // 3. Import the correct singular JSON file (e.g., ./messages/en.json)
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});