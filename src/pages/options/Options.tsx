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
import intl from "react-intl-universal";
import ArchitectApp from "@pages/options/architect/components/ArchitectApp";

const { Header } = Layout;
const MENU_KEYS = {
  SEARCH: "search",
  WRITER: "writer",
  HISTORY: "history",
  ARCHITECT: "architect",
  MORE: "more",
};

const getHeaderItems = (config: GluonConfigure): MenuProps["items"] => {
  const items: MenuProps["items"] = [
    {
      key: MENU_KEYS.SEARCH,
      label: intl.get("options_app_search").d("Search"),
    },
    {
      key: MENU_KEYS.ARCHITECT,
      label: intl.get("options_app_architect").d("Architect"),
    },
  ];
  if (config.enableWriting) {
    items.push({
      key: MENU_KEYS.WRITER,
      label: intl.get("options_app_writer").d("Writing"),
    });
  }
  if (config.enableHistoryRecording) {
    items.push({
      key: MENU_KEYS.HISTORY,
      label: intl.get("options_app_history").d("History"),
    });
  }
  items.push({
    key: MENU_KEYS.MORE,
    label: intl.get("options_app_more").d("Coming Soon"),
  });
  return items;
};

interface OptionsProps extends Record<string, unknown> {
  config: GluonConfigure;
}

const Logo: React.FC<{
  onClick: () => void;
  query: string;
  setQuery: (query: string) => void;
}> = ({ onClick, query, setQuery }) => (
  <div className="logo">
    <div className="logo-and-name" onClick={onClick}>
      <img src="/icons/gm_logo.png" alt="Logo" />
      <h6>{intl.get("assistant_name").d("Guru Mason")}</h6>
    </div>
    {!!query && <NavSearch query={query} onQueryChange={setQuery} />}
  </div>
);

const Options: React.FC<OptionsProps> = ({ config }) => {
  const [query, setQuery] = useState<string>("");
  const defaultSelectedItem = getHeaderItems(config)[0].key as string;
  const [selectedItem, setSelectedItem] = useState<string>(defaultSelectedItem);

  const clickLogoOrMenuItem = (item: string) => {
    setSelectedItem(item);
    if (item === MENU_KEYS.SEARCH) {
      setQuery("");
    }
  };

  return (
    <Layout>
      <Header id="app-header">
        <Logo
          query={query}
          setQuery={setQuery}
          onClick={() => handleMenuClick(MENU_KEYS.SEARCH)}
        />
        <div className="nav-menus">
          <Menu
            mode="horizontal"
            defaultSelectedKeys={[defaultSelectedItem]}
            selectedKeys={[selectedItem]}
            items={getHeaderItems(config)}
            onClick={(e) => clickLogoOrMenuItem(e.key)}
          />
        </div>
      </Header>
      {selectedItem === MENU_KEYS.SEARCH && (
        <SearchApp config={config} query={query} onQueryChange={setQuery} />
      )}
      {selectedItem === MENU_KEYS.ARCHITECT && <ArchitectApp config={config} />}
      {selectedItem === MENU_KEYS.WRITER && <WriterApp config={config} />}
      {selectedItem === MENU_KEYS.HISTORY && <HistoryApp config={config} />}
      {selectedItem === MENU_KEYS.MORE && <MoreComing />}
    </Layout>
  );
};

export default withErrorBoundary(
  withSuspense(Options, <div> Loading ... </div>),
  <div> Error Occur </div>,
);
