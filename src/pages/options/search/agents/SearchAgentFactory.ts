import OpenAI from "openai";
import SearchAgent from "./SearchAgent";
import { ThoughtAgentProps } from "@src/shared/agents/ThoughtAgent";
import intl from "react-intl-universal";
import { locale } from "@src/shared/utils/i18n";
import Conversation from "@src/shared/agents/core/Conversation";

class SearchAgentFactory {
  static create(config: any): SearchAgent {
    const client = new OpenAI({
      apiKey: config.apiKey ?? "",
      baseURL: config.baseURL,
      organization: config.organization,
      dangerouslyAllowBrowser: true,
    });

    const props: ThoughtAgentProps = {
      modelName: config.defaultModel ?? "gpt-3.5-turbo",
      toolsCallModel: config.toolsCallModel ?? null,
      client: client,
      language: intl.get(locale(config.language)).d("English"),
      conversation: new Conversation(),
      enableMultiModal: config.enableMultiModal ?? false,
      enableReflection: config.enableReflection ?? false,
    };

    return new SearchAgent(props);
  }
}

export default SearchAgentFactory;
