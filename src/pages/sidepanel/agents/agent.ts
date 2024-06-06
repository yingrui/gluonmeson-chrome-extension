import OpenAI from "openai";
import configureStorage from "@root/src/shared/storages/gluonConfig";
import GluonMesonAgent from "./GluonMesonAgent";

let defaultModel = "gpt-3.5-turbo";
let toolsCallModel: string = null;
let client: OpenAI;
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
});

class AgentFactory {
  static createGluonMesonAgent(): GluonMesonAgent {
    return new GluonMesonAgent(defaultModel, toolsCallModel, client);
  }
}

export default AgentFactory;
