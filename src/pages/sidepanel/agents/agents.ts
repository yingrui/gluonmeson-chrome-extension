import OpenAI from "openai";
import TrelloAgent from "./TrelloAgent";
import SummaryAgent from "./SummaryAgent";
import TranslateAgent from "./TranslateAgent";
import configureStorage from "@root/src/shared/storages/gluonConfig";

let defaultModelName = "gpt-3.5-turbo";
let toolsCallModel: string = null;
let client: OpenAI;
configureStorage.get().then((config) => {
  client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
    dangerouslyAllowBrowser: true,
  });
  defaultModelName = config.defaultModel
    ? config.defaultModel
    : defaultModelName;
  toolsCallModel = config.toolsCallModel
    ? config.toolsCallModel
    : toolsCallModel;
});

export const commands = {
  summary({ userInput }) {
    return new SummaryAgent(defaultModelName, client).summarize(userInput);
  },
  translate({ userInput }) {
    return new TranslateAgent(defaultModelName, client).translate(userInput);
  },
  trello({ userInput }) {
    return new TrelloAgent(defaultModelName, client).generateStory(userInput);
  },
};

class GluonMesonAgent {
  modelName = defaultModelName;
  mapToolsAgents = {};
  tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [];

  constructor() {
    this.addAgent(new SummaryAgent(defaultModelName, client));
    this.addAgent(new TranslateAgent(defaultModelName, client));
    this.addAgent(new TrelloAgent(defaultModelName, client));
  }

  private addAgent(agent: any) {
    for (const tool of agent.getTools()) {
      this.tools.push(tool);
      this.mapToolsAgents[tool.name] = agent;
    }
  }

  async callTool(messages: ChatMessage[]): Promise<any> {
    const chatCompletion = await client.chat.completions.create({
      model: toolsCallModel,
      messages: messages as OpenAI.ChatCompletionMessageParam[],
      stream: false,
      tools: this.tools,
    });

    const tool_calls = chatCompletion.choices[0].message.tool_calls;
    if (tool_calls) {
      for (const tool of tool_calls) {
        const agent = this.mapToolsAgents[tool.function.name];
        return agent.execute(tool);
      }
    }

    return client.chat.completions.create({
      messages: messages as OpenAI.ChatCompletionMessageParam[],
      model: this.modelName,
      stream: true,
    });
  }

  async chat(messages: ChatMessage[]) {
    const [command, userInput] = this.parseCommand(
      this.getLastUserInput(messages),
    );

    const commandExecutor = commands[command];

    if (commandExecutor) {
      return commandExecutor({ userInput });
    } else {
      if (toolsCallModel) {
        return this.callTool(messages);
      } else {
        return client.chat.completions.create({
          messages: messages as OpenAI.ChatCompletionMessageParam[],
          model: this.modelName,
          stream: true,
        });
      }
    }
  }

  private getLastUserInput(messages: ChatMessage[]) {
    return messages.slice(-1)[0].content;
  }

  private parseCommand(userInput: string): [string, string] {
    const commandKeys = Object.keys(commands);

    const matchedCommand = commandKeys.find((commandKey) =>
      userInput.match(new RegExp(`(?:^|\\s)/${commandKey}\\s+`)),
    );

    if (matchedCommand) {
      const input = userInput.match(
        new RegExp(`(?:^|\\s)/${matchedCommand}\\s+(.*)`),
      )[1];
      return [matchedCommand, input];
    }
    return ["chat", userInput];
  }
}

export default GluonMesonAgent;
