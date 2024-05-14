import OpenAI from "openai";
import TrelloAgent from "./TrelloAgent";
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

class WebpageSummarizationAgent {
  modelName = defaultModelName;

  constructor() {}

  private async get_content(): Promise<any> {
    return new Promise<any>(function (resolve, reject) {
      // send message to content script, call resolve() when received response"
      chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { type: "get_content" },
          (response) => {
            resolve(response);
          },
        );
      });
    });
  }

  async execute(userInput) {
    const content = await this.get_content();
    const prompt = `You're an assistant and good at summarization, the user is reading an article: ${content.title}. 
                    Please summarize the content according to user instruction: ${userInput}
                    The content text is: ${content.text}`;

    return await client.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: this.modelName,
      stream: true,
    });
  }
}

class TranslateAgent {
  modelName = defaultModelName;

  constructor() {}

  async execute(userInput) {
    const prompt = `You're an assistant and good at translation.
                    Please translate to Chinese according to user instruction, and generate result directly. 
                    Here is user input: ${userInput}`;

    return await client.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: this.modelName,
      stream: true,
    });
  }
}

export const commands = {
  summary({ userInput }) {
    return new WebpageSummarizationAgent().execute(userInput);
  },
  translate({ userInput }) {
    return new TranslateAgent().execute(userInput);
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
