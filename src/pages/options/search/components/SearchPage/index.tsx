import React, { useState } from "react";
import { Input } from "antd";
import "./index.css";
import { ddg_search } from "@src/shared/utils/duckduckgo";
import SearchResultItem from "@pages/options/search/components/SearchResultItem";

interface SearchPageProps {
  query: string;
  onQueryChange: (query: string) => void;
}

const { Search } = Input;

const SearchPage: React.FC<SearchPageProps> = ({ query, onQueryChange }) => {
  const [searchResult, setSearchResult] = useState<any>({
    search_results: [],
    query: "",
  });

  const search = async (queryString: string) => {
    if (searchResult.query !== queryString) {
      const result = await ddg_search(queryString);
      setSearchResult(result);
    }
  };
  search(query);

  return (
    <>
      <div className={"search-input-first-page"}>
        <div className={"search-results"}>
          {searchResult.search_results.map((result, index) => (
            <SearchResultItem result={result} key={index} />
          ))}
        </div>
      </div>
    </>
  );
};

export default SearchPage;
