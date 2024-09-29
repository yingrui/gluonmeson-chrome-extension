import React, { useState } from "react";
import { Layout, Menu, theme } from "antd";
import type { MenuProps } from "antd";

import withSuspense from "@src/shared/hoc/withSuspense";
import withErrorBoundary from "@src/shared/hoc/withErrorBoundary";
import WriterApp from "@pages/options/writer/components/WriterApp/WriterApp";
import "@pages/options/Options.css";

import GluonConfigure from "@src/shared/storages/gluonConfig";

const { Header, Content, Sider } = Layout;

const header_items: MenuProps["items"] = [
  { key: 1, label: "Writing" },
  { key: 2, label: "MORE COMING SOON" },
];

const Options: React.FC = (props: Record<string, unknown>) => {
  const config = props.config as GluonConfigure;

  return (
    <Layout>
      <Header id="app-header">
        <div className="demo-logo">
          <img src="/icons/gm_logo.png" />
          <h6>Guru Mason</h6>
        </div>
        <div className="nav-menus">
          <Menu
            theme="light"
            mode="horizontal"
            defaultSelectedKeys={["1"]}
            items={header_items}
            style={{ flex: 1, minWidth: 0 }}
          />
        </div>
      </Header>
      <WriterApp config={config} />
    </Layout>
  );
};

export default withErrorBoundary(
  withSuspense(Options, <div> Loading ... </div>),
  <div> Error Occur </div>,
);
