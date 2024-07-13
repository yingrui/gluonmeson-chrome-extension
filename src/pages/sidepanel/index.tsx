import React from "react";
import { createRoot } from "react-dom/client";
import "@pages/sidepanel/index.css";
import refreshOnUpdate from "virtual:reload-on-update-in-view";
import SidePanel from "@pages/sidepanel/SidePanel";
import AgentFactory from "./agents/AgentFactory";

refreshOnUpdate("pages/sidepanel");

function init() {
  const appContainer = document.querySelector("#app-container");
  if (!appContainer) {
    throw new Error("Can not find #app-container");
  }
  const root = createRoot(appContainer);
  AgentFactory.createGluonMesonAgent().then((agent) => {
    root.render(<SidePanel agent={agent} />);
  });
}

init();
