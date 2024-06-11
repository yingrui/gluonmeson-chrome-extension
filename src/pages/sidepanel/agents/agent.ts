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
  trelloSearchApi = config.trelloSearchApi
    ? config.trelloSearchApi
    : trelloSearchApi;
  apiKey = config.apiKey ? config.apiKey : apiKey;
  language = config.language ? config.language : language;
});

class AgentFactory {
  static createGluonMesonAgent(): GluonMesonAgent {
    return new GluonMesonAgent(
      defaultModel,
      toolsCallModel,
      client,
      language,
      AgentFactory.createAgents(),
    );
  }

  private static createAgents(): AgentWithTools[] {
    return [
      new SummaryAgent(defaultModel, client, language),
      new GoogleAgent(defaultModel, client, language),
      new TranslateAgent(defaultModel, client, language),
      new TrelloAgent(defaultModel, client, language, trelloSearchApi, apiKey),
    ];
  }
}

export default AgentFactory;
