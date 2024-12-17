import OpenAI from "openai";
import WriterContext from "@src/pages/options/writer/context/WriterContext";
import WriterAgent from "./WriterAgent";
import intl from "react-intl-universal";
import { locale } from "@src/shared/utils/i18n";
import { ThoughtAgentProps } from "@src/shared/agents/ThoughtAgent";
import Conversation from "@src/shared/agents/core/Conversation";

class WriterAgentFactory {
  static create(config: any, context: WriterContext): WriterAgent {
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

    return new WriterAgent(props, context);
  }
}

export default WriterAgentFactory;
