import React, { useRef, useState } from "react";
import { Layout, theme } from "antd";
import "./index.css";
import { ddg_search } from "@src/shared/utils/duckduckgo";
import SearchResultItem from "@pages/options/search/components/SearchResultItem";
import SearchSummary from "@pages/options/search/components/SearchSummary";
import SearchAgent from "@pages/options/search/agents/SearchAgent";

interface SearchPageProps {
  query: string;
  agent: SearchAgent;
}

const { Sider } = Layout;

const SearchPage: React.FC<SearchPageProps> = ({ query, agent }) => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const [searchResult, setSearchResult] = useState<any>({
    search_results: [],
    query: "",
  });
  const isSearchCompleted = useRef<boolean>(false);
  const [currentText, setCurrentText] = useState<string>();
  const [generating, setGenerating] = useState<boolean>();

  async function showStreamingMessage(result) {
    let message = "";
    setGenerating(true);

    const stream = result.stream;
    for await (const chunk of stream) {
      if (chunk.choices) {
        const finishReason = chunk.choices[0]?.finish_reason;
        const content = chunk.choices[0]?.delta?.content ?? "";
        message = message + content;
      } else {
        message = message + chunk.data;
      }

      setCurrentText(message);
    }
    setGenerating(false);
  }

  const search = async (queryString: string) => {
    isSearchCompleted.current = false;
    if (searchResult.query !== queryString) {
      const result = await ddg_search(queryString);
      setSearchResult(result);
      agent.setSearchResults(result);
      setCurrentText("");
      agent.summary({ userInput: queryString }, []).then(showStreamingMessage);
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
          <div className={"search-summary"}>
            <SearchSummary content={currentText} loading={generating} />
          </div>
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
