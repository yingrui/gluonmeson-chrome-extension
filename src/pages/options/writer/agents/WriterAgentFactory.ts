import OpenAI from "openai";
import WriterContext from "@src/pages/options/writer/context/WriterContext";
import WriterAgent from "./WriterAgent";
import intl from "react-intl-universal";
import { locale } from "@src/shared/utils/i18n";

class WriterAgentFactory {
  static create(config: any, context: WriterContext): WriterAgent {
    const defaultModel = config.defaultModel ?? "gpt-3.5-turbo";
    const toolsCallModel = config.toolsCallModel ?? null;
    const apiKey = config.apiKey ?? "";
    const language = intl.get(locale(config.language)).d("English");
    const enableReflection = config.enableReflection ?? false;

    const client = new OpenAI({
      apiKey: apiKey,
      baseURL: config.baseURL,
      organization: config.organization,
      dangerouslyAllowBrowser: true,
    });

    return new WriterAgent(
      defaultModel,
      toolsCallModel,
      client,
      language,
      context,
    );
  }
}

export default WriterAgentFactory;
