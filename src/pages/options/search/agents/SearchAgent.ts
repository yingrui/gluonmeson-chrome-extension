import OpenAI from "openai";
import ThoughtAgent from "@src/shared/agents/ThoughtAgent";
import { ddg_search } from "@src/shared/utils/duckduckgo";

class SearchAgent extends ThoughtAgent {
  constructor(
    defaultModelName: string,
    toolsCallModel: string,
    client: OpenAI,
    language: string,
  ) {
    super(defaultModelName, toolsCallModel, client, language);
  }

  async summary(args: object, messages: ChatMessage[]): Promise<any> {
    const userInput = args["userInput"];
    const results = await ddg_search(userInput);
    const prompt = `## Role
You're Chrome extension, you can answer user questions based on the search results from duckduckgo.

## Instructions
* If user question is closed question, directly answer it based on search results.
* If user question is open question:
  * Summarize and answer the question (add reference link in answer).
  * Recommend links or new search query to user.
* If user is asking what is or looking for details of something
  * Provide abstract information.
* If user is asking how to
  * Provide a framework or steps.
  * If possible, show result in mermaid chat.
* If user is asking what happened or what is the history of
  * Provide a timeline with related events with links.
* If user is asking for comparison
  * Provide a comparison table.

Note: List the related links.

## Search Results
${JSON.stringify(results)}

## User Input
${userInput}

`;
    return await this.chatCompletion([
      { role: "system", content: prompt },
      {
        role: "user",
        content: `please analysis search results and answer questions in ${this.language}:`,
      },
    ]);
  }
}

export default SearchAgent;
