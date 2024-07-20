import OpenAI from "openai";
import ThoughtAgent from "./ThoughtAgent";
import { get_content } from "@pages/sidepanel/utils";
import { ddg_search } from "@pages/sidepanel/utils/duckduckgo";

class GoogleAgent extends ThoughtAgent {
  constructor(
    defaultModelName: string,
    toolsCallModel: string,
    client: OpenAI,
    language: string,
  ) {
    super(defaultModelName, toolsCallModel, client, language);
    this.addTool("google", "only when user want to visit google.", [
      "userInput",
    ]);
    this.addTool(
      "search",
      "search content from duckduckgo api, this will not open duckduckgo webpage. if you want get direct answer, use this tool.",
      ["userInput"],
    );
  }

  async search(args: object, messages: ChatMessage[]): Promise<any> {
    const userInput = args["userInput"];
    const results = await ddg_search(userInput);
    const prompt = `## Role
You're Chrome extension, you can answer user questions based on the search results from duckduckgo.

## Instructions
* If user question is closed question, directly answer it based on search results.
* If user question is open question:
  * Summarize and answer the question (add reference link in answer).
  * List the related links.
  * Recommend links or new search query to user.
* If user is asking what is or looking for details of something
  * Provide abstract information.
  * List the related links.
* If user is asking how to
  * Provide a framework or steps.
  * If possible, show result in mermaid chat.
  * List the related links.
* If user is asking what happened or what is the history of
  * Provide a timeline with related events with links.
* If user is asking for comparison
  * Provide a comparison table.
  * List the related links.

## Search Results
${JSON.stringify(results)}

## User Input
${userInput}

`;
    return await this.chatCompletion([
      { role: "system", content: prompt },
      {
        role: "user",
        content: `please answer questions in ${this.language}`,
      },
    ]);
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
