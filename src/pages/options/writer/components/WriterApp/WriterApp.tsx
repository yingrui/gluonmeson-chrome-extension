import React from "react";
import { Layout } from "antd";

import WriterWorkspace from "@pages/options/writer/components/WriterWorkspace/WriterWorkspace";
import WriterAssistant from "@pages/options/writer/components/WriterAssistant/WriterAssistant";
import WriterContext from "@pages/options/writer/context/WriterContext";
import GluonConfigure from "@src/shared/storages/gluonConfig";

const WriterApp: React.FC = (props: Record<string, unknown>) => {
  const config = props.config as GluonConfigure;
  const context = new WriterContext(config);

  return (
    <Layout>
      <WriterWorkspace context={context}></WriterWorkspace>
      <WriterAssistant context={context}></WriterAssistant>
    </Layout>
  );
};

export default WriterApp;
