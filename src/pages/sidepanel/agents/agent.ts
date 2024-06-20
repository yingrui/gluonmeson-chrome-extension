import OpenAI from "openai";
import configureStorage from "@root/src/shared/storages/gluonConfig";
import AgentWithTools from "./AgentWithTools";
import GluonMesonAgent from "./GluonMesonAgent";
import BACopilotAgent from "./BACopilotAgent";
import SummaryAgent from "./SummaryAgent";
import TranslateAgent from "./TranslateAgent";
import GoogleAgent from "./GoogleAgent";

let defaultModel = "gpt-3.5-turbo";
let toolsCallModel: string = null;
let client: OpenAI;
let baCopilotKnowledgeApi = "";
let baCopilotApi = "";
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

  private static createAgents(): AgentWithTools[] {
    return [
      new SummaryAgent(defaultModel, client, language),
      new GoogleAgent(defaultModel, client, language),
      new TranslateAgent(defaultModel, client, language),
      new BACopilotAgent(
        defaultModel,
        client,
        language,
        baCopilotKnowledgeApi,
        baCopilotApi,
        apiKey,
      ),
    ];
  }
}

export default AgentFactory;
