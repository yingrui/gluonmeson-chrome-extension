import React from "react";
import { Layout } from "antd";

import WriterWorkspace from "@pages/options/writer/components/WriterWorkspace/WriterWorkspace";
import WriterAssistant from "@pages/options/writer/components/WriterAssistant/WriterAssistant";
import WriterContext from "@pages/options/writer/context/WriterContext";
import WriterAgentFactory from "@pages/options/writer/agents/WriterAgentFactory";
import type { GluonConfigure } from "@src/shared/storages/gluonConfig";
import ChatMessage from "@src/shared/agents/core/ChatMessage";
import intl from "react-intl-universal";

interface WriterAppProps {
  config: GluonConfigure;
}

const WriterApp: React.FC<WriterAppProps> = ({ config }) => {
  const context = new WriterContext(config);
  const initMessages = [
    new ChatMessage({
      role: "system",
      content: `As an assistant named Guru Mason. You can help users writing with given information.`,
    }),
    new ChatMessage({
      role: "assistant",
      content: intl
        .get("options_app_writer_assistant_greeting")
        .d("Ask me anything about writing!"),
      name: "Guru",
    }),
  ];

  const agent = new WriterAgentFactory().create(config, context, initMessages);

  return (
    <Layout>
      <WriterWorkspace context={context} agent={agent}></WriterWorkspace>
      <WriterAssistant
        context={context}
        initMessages={initMessages}
        agent={agent}
      ></WriterAssistant>
    </Layout>
  );
};

export default WriterApp;
