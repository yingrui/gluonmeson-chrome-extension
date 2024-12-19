import React from "react";
import { Layout } from "antd";

import WriterWorkspace from "@pages/options/writer/components/WriterWorkspace/WriterWorkspace";
import WriterAssistant from "@pages/options/writer/components/WriterAssistant/WriterAssistant";
import WriterContext from "@pages/options/writer/context/WriterContext";
import WriterAgent from "@pages/options/writer/agents/WriterAgent";
import WriterAgentFactory from "@pages/options/writer/agents/WriterAgentFactory";
import type { GluonConfigure } from "@src/shared/storages/gluonConfig";

interface WriterAppProps {
  config: GluonConfigure;
}

const WriterApp: React.FC<WriterAppProps> = ({ config }) => {
  const context = new WriterContext(config);
  const agent: WriterAgent = new WriterAgentFactory().create(config, context);

  return (
    <Layout>
      <WriterWorkspace context={context}></WriterWorkspace>
      <WriterAssistant context={context} agent={agent}></WriterAssistant>
    </Layout>
  );
};

export default WriterApp;
