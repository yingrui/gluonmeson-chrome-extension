import OpenAI from "openai";
import configureStorage from "@root/src/shared/storages/gluonConfig";
import ThoughtAgent from "./ThoughtAgent";
import GluonMesonAgent from "./GluonMesonAgent";
import BACopilotAgent from "./BACopilotAgent";
import SummaryAgent from "./SummaryAgent";
import TranslateAgent from "./TranslateAgent";
import UiTestAgent from "./UiTestAgent";
import GoogleAgent from "./GoogleAgent";

class AgentFactory {
  static createGluonMesonAgent(): Promise<GluonMesonAgent> {
    return new Promise<GluonMesonAgent>(function (resolve, reject) {
      configureStorage.get().then((config) => {
        const defaultModel = config.defaultModel ?? "gpt-3.5-turbo";
        const toolsCallModel = config.toolsCallModel ?? null;
        const baCopilotKnowledgeApi = config.baCopilotKnowledgeApi ?? "";
        const baCopilotTechDescription = config.baCopilotTechDescription ?? "";
        const baCopilotApi = config.baCopilotApi ?? "";
        const apiKey = config.apiKey ?? "";
        const language = config.language ?? "English";

        const client = new OpenAI({
          apiKey: config.apiKey,
          baseURL: config.baseURL,
          organization: config.organization,
          dangerouslyAllowBrowser: true,
        });

        const agents: ThoughtAgent[] = [
          new SummaryAgent(defaultModel, toolsCallModel, client, language),
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

        resolve(
          new GluonMesonAgent(
            defaultModel,
            toolsCallModel,
            client,
            language,
            agents,
          ),
        );
      });
    });
  }
}

export default AgentFactory;
