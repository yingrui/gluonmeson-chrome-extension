import OpenAI from "openai";
import AgentWithTools from "./AgentWithTools";
import { get_content } from "@pages/sidepanel/utils";

class SummaryAgent extends AgentWithTools {
  constructor(defaultModelName: string, client: OpenAI, language: string) {
    super(defaultModelName, client, language);
    this.addTool(
      "summary",
      "understand user's instruct and generate summary from given content for user",
      ["instruct"],
    );
    this.addTool(
      "ask_page",
      "Answer user's question based on current web page content",
      ["question"],
    );
  }

  /**
   * Execute command: summary and ask_page
   * @param {string} command - Command
   * @param {object} args - Arguments
   * @param {ChatMessage[]} messages - Messages
   * @returns {Promise<any>} ChatCompletion
   * @throws {Error} Unexpected tool call
   */
  async executeCommand(
    command: string,
    args: object,
    messages: ChatMessage[],
  ): Promise<any> {
    switch (command) {
      case "summary":
        return this.summarize(args["instruct"]);
      case "ask_page":
        return this.askPage(args["question"]);
    }
    throw new Error("Unexpected tool call in SummaryAgent: " + command);
  }

  async handleCannotGetContentError(): Promise<any> {
    const prompt = `You're an assistant or chrome copilot provided by GluonMeson, Guru Mason is your name.
The user is viewing the page, but you cannot get any information, it's possible because the you're detached from the webpage.
Reply sorry and ask user to refresh webpage, so you can get information from webpage.`;
    return await this.chatCompletion([
      { role: "system", content: prompt },
      { role: "user", content: `explain in ${this.language}:` },
    ]);
  }

  async summarize(instruct: string) {
    const content = await get_content();
    if (!content) return this.handleCannotGetContentError();

    const prompt = `You're an assistant and good at summarization, the user is reading an article: ${content.title}. 
Please summarize the content according to user instruction: ${instruct}
The content text is: ${content.text}
The links are: ${JSON.stringify(content.links)}`;

    return await this.chatCompletion([
      { role: "system", content: prompt },
      { role: "user", content: `please summarize text in ${this.language}:` },
    ]);
  }

  async askPage(question: string) {
    const content = await get_content();
    if (!content) return this.handleCannotGetContentError();

    const prompt = `You're an assistant, the user is reading an article: ${content.title}.
Please answer user's question: ${question}
The content text is: ${content.text}
The links are: ${JSON.stringify(content.links)}`;

    return await this.chatCompletion([
      { role: "system", content: prompt },
      { role: "user", content: `please answer in ${this.language}:` },
    ]);
  }
}

export default SummaryAgent;
