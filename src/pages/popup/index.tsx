import React from "react";
import { createRoot } from "react-dom/client";
import "@pages/popup/index.css";
import Popup from "@pages/popup/Popup";
import refreshOnUpdate from "virtual:reload-on-update-in-view";
import configureStorage from "@root/src/shared/storages/gluonConfig";
import { initI18n } from "@src/shared/utils/i18n";

refreshOnUpdate("pages/popup");

function init() {
  const appContainer = document.querySelector("#app-container");
  if (!appContainer) {
    throw new Error("Can not find #app-container");
  }
  configureStorage.get().then((config) => {
    initI18n(config.language).then(() => {
      const root = createRoot(appContainer);
      root.render(<Popup />);
    });
  });
}

init();
