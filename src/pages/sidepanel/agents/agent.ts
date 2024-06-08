import OpenAI from "openai";
import configureStorage from "@root/src/shared/storages/gluonConfig";
import GluonMesonAgent from "./GluonMesonAgent";
import TrelloAgent from "./TrelloAgent";
import SummaryAgent from "./SummaryAgent";
import TranslateAgent from "./TranslateAgent";
import GoogleAgent from "./GoogleAgent";

let defaultModel = "gpt-3.5-turbo";
let toolsCallModel: string = null;
let client: OpenAI;
let trelloSearchApi = "";
let apiKey = "";
configureStorage.get().then((config) => {
  client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
    dangerouslyAllowBrowser: true,
  });
  defaultModel = config.defaultModel ? config.defaultModel : defaultModel;
  toolsCallModel = config.toolsCallModel
    ? config.toolsCallModel
    : toolsCallModel;
  trelloSearchApi = config.trelloSearchApi
    ? config.trelloSearchApi
    : trelloSearchApi;
  apiKey = config.apiKey ? config.apiKey : apiKey;
});

class AgentFactory {
  static createGluonMesonAgent(): GluonMesonAgent {
    return new GluonMesonAgent(
      defaultModel,
      toolsCallModel,
      client,
      AgentFactory.createAgents(),
    );
  }

  private static createAgents(): AgentWithTools[] {
    return [
      new SummaryAgent(defaultModel, client),
      new GoogleAgent(defaultModel, client),
      new TranslateAgent(defaultModel, client),
      new TrelloAgent(defaultModel, client, trelloSearchApi, apiKey),
    ];
  }
}

export default AgentFactory;
