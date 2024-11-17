import React, { useState } from "react";
import { Layout } from "antd";
import type { GluonConfigure } from "@src/shared/storages/gluonConfig";
import SearchInput from "@pages/options/search/components/SearchInput";
import "./index.css";

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
  const [input, setInput] = useState<string>(query);

  const onChange = (value: string) => {
    console.log("search app, search input value change:", value, !input);
    setInput(value);
    onQueryChange(value);
  };

  return (
    <Layout className={"search-app"}>
      {!input && <SearchInput query={input} onQueryChange={onChange} />}
      {input && (
        <>
          <div>{input}</div>
        </>
      )}
    </Layout>
  );
};

export default SearchApp;
