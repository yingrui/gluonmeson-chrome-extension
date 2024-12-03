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
import HistoryApp from "@pages/options/history/components/HistoryApp";

const { Header } = Layout;

const SearchItemKey = "search";
const WriterItemKey = "writer";
const HistoryItemKey = "history";
const OtherItemKey = "more";

const getHeaderItems = (config: GluonConfigure) => {
  const header_items: MenuProps["items"] = [];
  header_items.push({ key: SearchItemKey, label: "Search" });
  if (config.enableWriting) {
    header_items.push({ key: WriterItemKey, label: "Writing" });
  }
  if (config.enableHistoryRecording) {
    header_items.push({ key: HistoryItemKey, label: "History" });
  }
  header_items.push({ key: OtherItemKey, label: "Coming Soon" });
  return header_items;
};

interface OptionsProps extends Record<string, unknown> {
  config: GluonConfigure;
}

const Options: React.FC<OptionsProps> = ({ config }) => {
  const [query, setQuery] = useState<string>("");
  const defaultSelectedItem = getHeaderItems(config)[0].key as string;
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
            items={getHeaderItems(config)}
            style={{ flex: 1, minWidth: 0 }}
            onClick={(e) => handleMenuClick(e.key)}
          />
        </div>
      </Header>
      {selectedItem === SearchItemKey && (
        <SearchApp config={config} query={query} onQueryChange={setQuery} />
      )}
      {selectedItem === WriterItemKey && <WriterApp config={config} />}
      {selectedItem === HistoryItemKey && <HistoryApp config={config} />}
      {selectedItem === OtherItemKey && <MoreComing />}
    </Layout>
  );
};

export default withErrorBoundary(
  withSuspense(Options, <div> Loading ... </div>),
  <div> Error Occur </div>,
);
