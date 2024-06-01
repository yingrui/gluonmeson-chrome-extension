import OpenAI from "openai";
import Tool from "./tool";
import AgentWithTools from "./AgentWithTools";

class GoogleAgent extends AgentWithTools {
  constructor(defaultModelName: string, client: OpenAI) {
    super(defaultModelName, client);
    this.addTool(
      "google",
      "search content from google according to user questions",
      ["userInput"],
    );
  }

  async executeCommand(command: string, args: object): Promise<any> {
    if (command === "google") {
      return this.search(args["userInput"]);
    }
    throw new Error("Unexpected tool call in GoogleAgent: " + command);
  }

  private openGoogle(userInput: string): void {
    const url = `https://www.google.com/search?q=${userInput}`;
    chrome.tabs.query(
      { currentWindow: true, url: "https://www.google.com/*" },
      (tabs) => {
        if (tabs.length > 0) {
          for (const tab of tabs) {
            chrome.tabs.update(tab.id, { selected: true, url: url });
            break;
          }
        } else {
          chrome.tabs.create({ url: url });
        }
      },
    );
  }

  async search(userInput: string): Promise<any> {
    const prompt = `You're Chrome extension, you can help users to browse google.
You can understand user's questions and then open the google to search content for them.
This is user input:${userInput}
Tell user you helped them to opened google, if user input is empty, just open the google webpage.`;

    this.openGoogle(userInput);

    return await this.chatCompletion([{ role: "system", content: prompt }]);
  }
}

export default GoogleAgent;
