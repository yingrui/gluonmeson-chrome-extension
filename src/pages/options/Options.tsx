import React, { useState } from "react";
import { Layout, Menu } from "antd";
import type { MenuProps } from "antd";

import withSuspense from "@src/shared/hoc/withSuspense";
import withErrorBoundary from "@src/shared/hoc/withErrorBoundary";
import WriterApp from "@pages/options/writer/components/WriterApp/WriterApp";
import SearchApp from "@pages/options/search/components/SearchApp";
import "@pages/options/Options.css";

import type { GluonConfigure } from "@src/shared/storages/gluonConfig";
import NavSearch from "@pages/options/components/NavSearch";
import MoreComing from "@pages/options/components/MoreComing";

const { Header } = Layout;

const SearchItemKey = "search";
const WriterItemKey = "writer";
const OtherItemKey = "more";

const header_items: MenuProps["items"] = [
  { key: SearchItemKey, label: "Search" },
  { key: WriterItemKey, label: "Writing" },
  { key: OtherItemKey, label: "Coming Soon" },
];

interface OptionsProps extends Record<string, unknown> {
  config: GluonConfigure;
}

const Options: React.FC<OptionsProps> = ({ config }) => {
  const [query, setQuery] = useState<string>("");
  const defaultSelectedItem = header_items[0].key as string;
  const [selectedItem, setSelectedItem] = useState<string>(defaultSelectedItem);

  const handleMenuClick = (item: string) => {
    setSelectedItem(item);
    if (item === SearchItemKey) {
      setQuery("");
    }
  };

  return (
    <Layout>
      <Header id="app-header">
        <div className="logo">
          <div
            className="logo-and-name"
            onClick={() => handleMenuClick(SearchItemKey)}
          >
            <img src="/icons/gm_logo.png" />
            <h6>Guru Mason</h6>
          </div>
          {!!query && <NavSearch query={query} onQueryChange={setQuery} />}
        </div>
        <div className="nav-menus">
          <Menu
            theme="light"
            mode="horizontal"
            defaultSelectedKeys={[defaultSelectedItem]}
            selectedKeys={[selectedItem]}
            items={header_items}
            style={{ flex: 1, minWidth: 0 }}
            onClick={(e) => handleMenuClick(e.key)}
          />
        </div>
      </Header>
      {selectedItem === SearchItemKey && (
        <SearchApp config={config} query={query} onQueryChange={setQuery} />
      )}
      {selectedItem === WriterItemKey && <WriterApp config={config} />}
      {selectedItem === OtherItemKey && <MoreComing />}
    </Layout>
  );
};

export default withErrorBoundary(
  withSuspense(Options, <div> Loading ... </div>),
  <div> Error Occur </div>,
);
