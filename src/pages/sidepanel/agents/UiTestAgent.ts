import OpenAI from "openai";
import Tool from "./tool";
import AgentWithTools from "./AgentWithTools";
import { get_html } from "@pages/sidepanel/utils";

class UiTestAgent extends AgentWithTools {
  constructor(defaultModelName: string, client: OpenAI, language: string) {
    super(defaultModelName, client, language);
    this.addTool(
      "generate_test",
      "understand user's instruct and generate an E2E test for current viewing webpage",
      ["instruct"],
    );
  }

  /**
   * Execute command: generate_test
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
      case "generate_test":
        return this.generate_test(args["instruct"]);
    }
    throw new Error("Unexpected tool call in UiTestAgent: " + command);
  }

  async handleCannotGetHtmlError(): Promise<any> {
    const prompt = `You're an assistant or chrome copilot provided by GluonMeson, Guru Mason is your name.
The user is viewing the page, but you cannot get any information, it's possible because the you're detached from the webpage.
Reply sorry and ask user to refresh webpage, so you can get information from webpage.`;
    return await this.chatCompletion([
      { role: "system", content: prompt },
      { role: "user", content: `explain in ${this.language}:` },
    ]);
  }

  async generate_test(instruct: string) {
    const page = await get_html();
    if (!page) return this.handleCannotGetHtmlError();

    const html =
      page.html.length > 128 * 1024
        ? page.html.slice(0, 128 * 1024)
        : page.html;

    const prompt = `You're a senior QA engineer and good at cypress e2e test.
The user is viewing webpage: ${page.url} ${page.title}.
Please generate cypress e2e test according to user instruction: ${instruct}
The webpage html is below:
${html}`;

    return await this.chatCompletion([
      { role: "system", content: prompt },
      { role: "user", content: `please generate cypress test:` },
    ]);
  }
}

export default UiTestAgent;
