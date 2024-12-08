import React from "react";
import { createRoot } from "react-dom/client";
import "@pages/popup/index.css";
import Popup from "@pages/popup/Popup";
import refreshOnUpdate from "virtual:reload-on-update-in-view";
import intl from "react-intl-universal";
import configureStorage from "@root/src/shared/storages/gluonConfig";

refreshOnUpdate("pages/popup");

function init() {
  const appContainer = document.querySelector("#app-container");
  if (!appContainer) {
    throw new Error("Can not find #app-container");
  }

  initI18n().then(() => {
    const root = createRoot(appContainer);
    root.render(<Popup />);
  });
}

async function initI18n() {
  const locales = {
    en: await import("@src/locales/en-US.json"),
    zh: await import("@src/locales/zh-CN.json"),
  };
  const language = await configureStorage
    .get()
    .then((config) => config.language);
  const locale = language === "en" ? "en" : "zh";
  await intl.init({ currentLocale: locale, locales });
}

init();
