import React, { useState } from "react";
import { Layout } from "antd";
import type { GluonConfigure } from "@src/shared/storages/gluonConfig";
import "./index.css";
import SearchHome from "@pages/options/search/components/SearchHome";
import SearchPage from "@pages/options/search/components/SearchPage";

interface SearchAppProps {
  config: GluonConfigure;
  query: string;
  onQueryChange: (query: string) => void;
}

const SearchApp: React.FC<SearchAppProps> = ({
  config,
  query,
  onQueryChange,
}) => {
  return (
    <Layout className={"search-app"}>
      {!query && <SearchHome query={query} onQueryChange={onQueryChange} />}
      {query && <SearchPage query={query} onQueryChange={onQueryChange} />}
    </Layout>
  );
};

export default SearchApp;
