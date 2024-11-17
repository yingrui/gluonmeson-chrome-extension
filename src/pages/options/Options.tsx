import React, { useState } from "react";
import { Layout, Menu } from "antd";
import type { MenuProps } from "antd";

import withSuspense from "@src/shared/hoc/withSuspense";
import withErrorBoundary from "@src/shared/hoc/withErrorBoundary";
import WriterApp from "@pages/options/writer/components/WriterApp/WriterApp";
import SearchApp from "@pages/options/search/components/SearchApp";
import "@pages/options/Options.css";

import type { GluonConfigure } from "@src/shared/storages/gluonConfig";

const { Header } = Layout;

const SearchItemKey = "search";
const WriterItemKey = "writer";
const OtherItemKey = "more";

const header_items: MenuProps["items"] = [
  { key: SearchItemKey, label: "Search" },
  { key: WriterItemKey, label: "Writing" },
  { key: OtherItemKey, label: "MORE COMING SOON" },
];

interface OptionsProps extends Record<string, unknown> {
  config: GluonConfigure;
}

const Options: React.FC<OptionsProps> = ({ config }) => {
  const defaultSelectedItem = header_items[0].key as string;
  const [selectedItem, setSelectedItem] = useState<string>(defaultSelectedItem);

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    setSelectedItem(e.key);
  };

  const [query, setQuery] = useState<string>("");

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
            defaultSelectedKeys={[defaultSelectedItem]}
            selectedKeys={[selectedItem]}
            items={header_items}
            style={{ flex: 1, minWidth: 0 }}
            onClick={handleMenuClick}
          />
        </div>
      </Header>
      {selectedItem === SearchItemKey && (
        <SearchApp config={config} query={query} onQueryChange={setQuery} />
      )}
      {selectedItem === WriterItemKey && <WriterApp config={config} />}
      {selectedItem === OtherItemKey && <div>More Coming Soon!</div>}
    </Layout>
  );
};

export default withErrorBoundary(
  withSuspense(Options, <div> Loading ... </div>),
  <div> Error Occur </div>,
);
