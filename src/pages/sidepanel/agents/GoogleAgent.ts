import OpenAI from "openai";
import ThoughtAgent from "./ThoughtAgent";
import { get_content } from "@pages/sidepanel/utils";

class GoogleAgent extends ThoughtAgent {
  constructor(
    defaultModelName: string,
    toolsCallModel: string,
    client: OpenAI,
    language: string,
  ) {
    super(defaultModelName, toolsCallModel, client, language);
    this.addTool(
      "google",
      "search content from google according to user questions",
      ["userInput"],
    );
  }

  async google(args: object, messages: ChatMessage[]): Promise<any> {
    const userInput = args["userInput"];
    const url = await this.openGoogle(userInput);
    const content = await this.get_google_result(url, userInput);

    const prompt = `You're Chrome extension, you can help users to browse google.
You can understand user's questions, open the google to search content, and most important, you can answer user's question based on search results
This is user input:${userInput}
Tell user you helped them to navigate to ${url}, if user input is empty, just open the google webpage.
The search results page information are:
- url: ${content.url}
- title: ${content.title}
- text: ${content.text}
The links are: ${JSON.stringify(content.links)}`;

    return await this.chatCompletion([
      { role: "system", content: prompt },
      {
        role: "user",
        content: `please summarize this page in ${this.language}, and recommend links or new search query: `,
      },
    ]);
  }

  private openGoogle(userInput: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const url = `https://www.google.com/search?q=${userInput}`;
      chrome.tabs.query({ currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
          for (const tab of tabs) {
            if (!!tab.url && tab.url.includes("https://www.google.com")) {
              chrome.tabs.update(tab.id, { selected: true, url: url });
              resolve(url);
              return;
            }
          }
        }
        chrome.tabs.create({ url: url });
        resolve(url);
      });
    });
  }

  private async get_google_result(url, userInput): Promise<any> {
    let count = 0;
    return new Promise<any>(function (resolve, reject) {
      function get_search_result(resolve) {
        count += 1;
        setTimeout(() => {
          get_content().then((response) => {
            if (response && response.title.includes(userInput)) {
              resolve(response);
            } else {
              if (count < 5) {
                get_search_result(resolve);
              } else {
                resolve(response);
              }
            }
          });
        }, 1000);
      }
      get_search_result(resolve);
    });
  }
}

export default GoogleAgent;
