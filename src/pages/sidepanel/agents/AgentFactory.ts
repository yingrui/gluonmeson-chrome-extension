import OpenAI from "openai";
import configureStorage from "@root/src/shared/storages/gluonConfig";
import ThoughtAgent from "./ThoughtAgent";
import GluonMesonAgent from "./GluonMesonAgent";
import BACopilotAgent from "./BACopilotAgent";
import SummaryAgent from "./SummaryAgent";
import TranslateAgent from "./TranslateAgent";
import UiTestAgent from "./UiTestAgent";
import GoogleAgent from "./GoogleAgent";

let defaultModel = "gpt-3.5-turbo";
let toolsCallModel: string = null;
let client: OpenAI;
let baCopilotKnowledgeApi = "";
let baCopilotApi = "";
let baCopilotTechDescription = "";
let language = "English";
let apiKey = "";
configureStorage.get().then((config) => {
  client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
    organization: config.organization,
    dangerouslyAllowBrowser: true,
  });
  defaultModel = config.defaultModel ? config.defaultModel : defaultModel;
  toolsCallModel = config.toolsCallModel
    ? config.toolsCallModel
    : toolsCallModel;
  baCopilotKnowledgeApi = config.baCopilotKnowledgeApi
    ? config.baCopilotKnowledgeApi
    : baCopilotKnowledgeApi;
  baCopilotTechDescription = config.baCopilotTechDescription
    ? config.baCopilotTechDescription
    : baCopilotTechDescription;
  baCopilotApi = config.baCopilotApi ? config.baCopilotApi : baCopilotApi;
  apiKey = config.apiKey ? config.apiKey : apiKey;
  language = config.language ? config.language : language;
});

let agent: GluonMesonAgent = null;

class AgentFactory {
  static createGluonMesonAgent(): GluonMesonAgent {
    if (!agent) {
      agent = new GluonMesonAgent(
        defaultModel,
        toolsCallModel,
        client,
        language,
        AgentFactory.createAgents(),
      );
    }
    return agent;
  }

  private static createAgents(): ThoughtAgent[] {
    return [
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
  }
}

export default AgentFactory;
