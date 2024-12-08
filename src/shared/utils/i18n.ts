import intl from "react-intl-universal";

export async function initI18n(language: string) {
  const locales = {
    en: await import("@src/locales/en-US.json"),
    zh: await import("@src/locales/zh-CN.json"),
  };
  const locale = language === "en" ? "en" : "zh";
  await intl.init({ currentLocale: locale, locales });
}
