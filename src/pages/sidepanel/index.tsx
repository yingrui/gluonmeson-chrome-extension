import React from "react";
import { createRoot } from "react-dom/client";
import "@pages/sidepanel/index.css";
import refreshOnUpdate from "virtual:reload-on-update-in-view";
import configureStorage from "@root/src/shared/storages/gluonConfig";
import SidePanel from "@pages/sidepanel/SidePanel";
import AgentFactory from "./agents/AgentFactory";

refreshOnUpdate("pages/sidepanel");

function getInitialSystemMessage(language: string): string {
  return `As an assistant or chrome copilot provided by GluonMeson, named Guru Mason.
You can decide to call different tools or directly answer questions in ${language}, should not add assistant in answer.
Output format should be in markdown format, and use mermaid format for diagram generation.`;
}

function getInitialMessages(language: string): ChatMessage[] {
  const messages = [
    {
      role: "system",
      content: getInitialSystemMessage(language),
    },
    { role: "assistant", content: "Hello! How can I assist you today?" },
  ] as ChatMessage[];
  return messages;
}

function init() {
  const appContainer = document.querySelector("#app-container");
  if (!appContainer) {
    throw new Error("Can not find #app-container");
  }
  const root = createRoot(appContainer);
  configureStorage.get().then((config) => {
    const language = config.language ?? "English";
    const initMessages = getInitialMessages(language);
    const agent = AgentFactory.createGluonMesonAgent(config, initMessages);
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
