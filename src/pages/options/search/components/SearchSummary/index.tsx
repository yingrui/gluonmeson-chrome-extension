import React from "react";

interface SearchSummaryProps {
  query: string;
  result: any;
}

const SearchSummary: React.FC<SearchSummaryProps> = ({ query, result }) => {
  return <div>{query}</div>;
};

export default SearchSummary;
