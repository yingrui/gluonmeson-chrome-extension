import React, { useState } from "react";
import { Input } from "antd";
import "./index.css";

interface SearchPageProps {
  query: string;
  onQueryChange: (query: string) => void;
}

const { Search } = Input;

const SearchPage: React.FC<SearchPageProps> = ({ query, onQueryChange }) => {
  const [queryString, setQueryString] = useState<string>(query);

  const handleSubmit = (queryString: string) => {
    onQueryChange(queryString);
  };

  return (
    <>
      <div className={"search-input-first-page"}>
        <div className={"search-input-area"}>
          <Search
            className={"search-input"}
            onChange={(e) => setQueryString(e.target.value)}
            onSearch={handleSubmit}
            value={queryString}
          />
        </div>
      </div>
    </>
  );
};

export default SearchPage;
