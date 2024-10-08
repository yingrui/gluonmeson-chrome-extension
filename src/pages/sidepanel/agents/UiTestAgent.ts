import OpenAI from "openai";
import ThoughtAgent from "@src/shared/agents/ThoughtAgent";
import { get_html } from "@src/shared/utils";

class UiTestAgent extends ThoughtAgent {
  constructor(
    defaultModelName: string,
    toolsCallModel: string,
    client: OpenAI,
    language: string,
  ) {
    super(defaultModelName, toolsCallModel, client, language);
    this.addTool(
      "ui_test",
      "understand user's instruct and generate an UI E2E test for current viewing webpage",
      ["userInput"],
    );
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

  async ui_test(args: object, messages: ChatMessage[]) {
    const userInput = args["userInput"];
    const page = await get_html();
    if (!page) return this.handleCannotGetHtmlError();

    const html =
      page.html.length > 128 * 1024
        ? page.html.slice(0, 128 * 1024)
        : page.html;

    const prompt = `You're a senior QA engineer and good at cypress e2e test.
The user is viewing webpage: ${page.url} ${page.title}.
Please generate cypress e2e test according to user instruction: ${userInput}
The webpage html is below:
${html}`;

    return await this.chatCompletion([
      { role: "system", content: prompt },
      { role: "user", content: `please generate cypress test:` },
    ]);
  }
}

export default UiTestAgent;
