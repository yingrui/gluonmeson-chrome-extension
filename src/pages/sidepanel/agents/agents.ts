import OpenAI from "openai";
import { CONFIG_STAORAGE_KEY } from "../../popup/Popup";

const storage = chrome.storage.local;
let client: OpenAI;

storage.get(CONFIG_STAORAGE_KEY, function (items) {
  if (items?.[CONFIG_STAORAGE_KEY]) {
    client = new OpenAI({
      apiKey: items?.[CONFIG_STAORAGE_KEY].apiKey,
      baseURL: items?.[CONFIG_STAORAGE_KEY].baseURL,
      dangerouslyAllowBrowser: true,
    });
  }
});

class WebpageSummarizationAgent {
  modelName = "gpt-3.5-turbo";

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

  async summarize(userInput) {
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

class GluonMesonAgent {
  modelName = "gpt-3.5-turbo";

  constructor() {}

  async chat(messages: ChatMessage[]) {
    const [command, userInput] = this.parseCommand(
      this.getLastUserInput(messages),
    );
    switch (command) {
      case "chat": {
        return await client.chat.completions.create({
          messages: messages as OpenAI.ChatCompletionMessageParam[],
          model: this.modelName,
          stream: true,
        });
      }
      case "summarize_webpage":
        return await new WebpageSummarizationAgent().summarize(userInput);
    }
  }

  private getLastUserInput(messages: ChatMessage[]) {
    return messages.slice(-1)[0].content;
  }

  private parseCommand(userInput: string): [string, string] {
    if (userInput.startsWith("/summarize_webpage")) {
      return ["summarize_webpage", userInput];
    }
    return ["chat", userInput];
  }
}

export default GluonMesonAgent;
