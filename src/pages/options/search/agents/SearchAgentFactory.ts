import OpenAI from "openai";
import SearchAgent from "./SearchAgent";

class SearchAgentFactory {
  static create(config: any): SearchAgent {
    const defaultModel = config.defaultModel ?? "gpt-3.5-turbo";
    const toolsCallModel = config.toolsCallModel ?? null;
    const apiKey = config.apiKey ?? "";
    const language = config.language ?? "English";

    const client = new OpenAI({
      apiKey: apiKey,
      baseURL: config.baseURL,
      organization: config.organization,
      dangerouslyAllowBrowser: true,
    });

    return new SearchAgent(defaultModel, toolsCallModel, client, language);
  }
}

export default SearchAgentFactory;
