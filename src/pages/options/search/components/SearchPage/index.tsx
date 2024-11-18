import React, { useRef, useState } from "react";
import { Layout, theme } from "antd";
import "./index.css";
import { ddg_search } from "@src/shared/utils/duckduckgo";
import SearchResultItem from "@pages/options/search/components/SearchResultItem";
import SearchSummary from "@pages/options/search/components/SearchSummary";

interface SearchPageProps {
  query: string;
  onQueryChange: (query: string) => void;
}

const { Sider } = Layout;

const SearchPage: React.FC<SearchPageProps> = ({ query, onQueryChange }) => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const [searchResult, setSearchResult] = useState<any>({
    search_results: [],
    query: "",
  });
  const isSearchCompleted = useRef<boolean>(false);

  const search = async (queryString: string) => {
    isSearchCompleted.current = false;
    if (searchResult.query !== queryString) {
      const result = await ddg_search(queryString);
      setSearchResult(result);
    }
    isSearchCompleted.current = true;
  };
  search(query);

  return (
    <Layout className={"search-page"}>
      <Sider
        className={"search-page-sider"}
        width={245}
        style={{ background: colorBgContainer }}
      ></Sider>
      <div className={"search-page-results"}>
        {isSearchCompleted.current && (
          <SearchSummary query={query} result={searchResult} />
        )}
        <div className={"search-results"}>
          {searchResult.search_results.map((result, index) => (
            <SearchResultItem result={result} key={index} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default SearchPage;
