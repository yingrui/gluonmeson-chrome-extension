import React from "react";
import { createRoot } from "react-dom/client";
import "@pages/sidepanel/index.css";
import refreshOnUpdate from "virtual:reload-on-update-in-view";
import configureStorage from "@root/src/shared/storages/gluonConfig";
import SidePanel from "@pages/sidepanel/SidePanel";
import AgentFactory from "./agents/AgentFactory";

refreshOnUpdate("pages/sidepanel");

function init() {
  const appContainer = document.querySelector("#app-container");
  if (!appContainer) {
    throw new Error("Can not find #app-container");
  }
  const root = createRoot(appContainer);
  configureStorage.get().then((config) => {
    const agent = AgentFactory.createGluonMesonAgent(config);
    const initMessages = agent.getInitialMessages();
    const enableReflection = config.enableReflection ?? false;
    root.render(
      <SidePanel
        agent={agent}
        initMessages={initMessages}
        enableReflection={enableReflection}
      />,
    );
  });
}

init();
