import React from "react";

interface SearchResultItemProps {
  result: any;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({ result }) => {
  return (
    <div className="search-result-item">
      <a href={result.u} target="_blank" rel="noopener noreferrer">
        <h3>{result.t}</h3>
      </a>
      <p>{result.a}</p>
      <small>{result.d}</small>
    </div>
  );
};

export default SearchResultItem;
