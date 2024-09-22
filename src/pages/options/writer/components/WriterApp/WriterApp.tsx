import React from "react";
import { Layout } from "antd";
import "./WriterApp.css";

import WriterWorkspace from "@pages/options/writer/components/WriterWorkspace/WriterWorkspace";
import WriterAssistant from "@pages/options/writer/components/WriterAssistant/WriterAssistant";

const WriterApp: React.FC = () => {
  return (
    <Layout>
      <WriterWorkspace></WriterWorkspace>
      <WriterAssistant></WriterAssistant>
    </Layout>
  );
};

export default WriterApp;
