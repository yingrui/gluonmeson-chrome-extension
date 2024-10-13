import OpenAI from "openai";
import ThoughtAgent from "@src/shared/agents/ThoughtAgent";
import GluonMesonAgent from "./GluonMesonAgent";
import BACopilotAgent from "./BACopilotAgent";
import TranslateAgent from "./TranslateAgent";
import UiTestAgent from "./UiTestAgent";
import GoogleAgent from "./GoogleAgent";

class AgentFactory {
  static createGluonMesonAgent(config: any): GluonMesonAgent {
    const defaultModel = config.defaultModel ?? "gpt-3.5-turbo";
    const toolsCallModel = config.toolsCallModel ?? null;
    const baCopilotKnowledgeApi = config.baCopilotKnowledgeApi ?? "";
    const baCopilotTechDescription = config.baCopilotTechDescription ?? "";
    const baCopilotApi = config.baCopilotApi ?? "";
    const apiKey = config.apiKey ?? "";
    const language = config.language ?? "English";
    const enableReflection = config.enableReflection ?? false;

    const client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      organization: config.organization,
      dangerouslyAllowBrowser: true,
    });

    const agents: ThoughtAgent[] = [
      new GoogleAgent(defaultModel, toolsCallModel, client, language),
      new TranslateAgent(defaultModel, toolsCallModel, client, language),
      new UiTestAgent(defaultModel, toolsCallModel, client, language),
      new BACopilotAgent(
        defaultModel,
        toolsCallModel,
        client,
        language,
        baCopilotKnowledgeApi,
        baCopilotApi,
        baCopilotTechDescription,
        apiKey,
      ),
    ];

    return new GluonMesonAgent(
      defaultModel,
      toolsCallModel,
      client,
      language,
      agents,
    );
  }
}

export default AgentFactory;
