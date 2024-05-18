import OpenAI from "openai";
import TrelloAgent from "./TrelloAgent";
import SummaryAgent from "./SummaryAgent";
import TranslateAgent from "./TranslateAgent";
import configureStorage from "@root/src/shared/storages/gluonConfig";

const defaultModelName = "gpt-3.5-turbo";
let client: OpenAI;
configureStorage.get().then((config) => {
  client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
    dangerouslyAllowBrowser: true,
  });
});

export const commands = {
  summary({ userInput }) {
    return new SummaryAgent(defaultModelName, client).execute(userInput);
  },
  translate({ userInput }) {
    return new TranslateAgent(defaultModelName, client).execute(userInput);
  },
  trello({ userInput }) {
    return new TrelloAgent(defaultModelName, client).execute(userInput);
  },
};

class GluonMesonAgent {
  modelName = defaultModelName;

  constructor() {}

  async chat(messages: ChatMessage[]) {
    const [command, userInput] = this.parseCommand(
      this.getLastUserInput(messages),
    );

    const commandExecutor = commands[command];

    if (commandExecutor) {
      return commandExecutor({ userInput });
    } else {
      return client.chat.completions.create({
        messages: messages as OpenAI.ChatCompletionMessageParam[],
        model: this.modelName,
        stream: true,
      });
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
      return [matchedCommand, userInput];
    }
    return ["chat", userInput];
  }
}

export default GluonMesonAgent;
