import ThoughtAgent, {
  ThoughtAgentProps,
} from "@src/shared/agents/ThoughtAgent";
import CompositeAgent from "@src/shared/agents/CompositeAgent";

import { get_content } from "@src/shared/utils";
import ThinkResult from "@src/shared/agents/core/ThinkResult";
import Environment from "@src/shared/agents/core/Environment";
import ChatMessage, { imageContent } from "@src/shared/agents/core/ChatMessage";

/**
 * GluonMeson Agent
 * @extends {CompositeAgent} - Agent with tools
 */
class GluonMesonAgent extends CompositeAgent {
  constructor(
    props: ThoughtAgentProps,
    name: string = "Guru",
    description: string = "Guru",
    agents: ThoughtAgent[] = [],
  ) {
    super(props, name, description, agents);
    this.addTools();
  }

  /**
   * Add the self agent tools to chatCompletionTools and mapToolsAgents.
   */
  private addTools(): void {
    this.addTool(
      "summary",
      "Based on current web page content, answer user's question or follow the user instruction to generate content for them.",
      ["userInput", "task"],
    );
  }

  private async handleCannotGetContentError(): Promise<ThinkResult> {
    const prompt = `You're an assistant or chrome copilot provided by GluonMeson, Guru Mason is your name.
The user is viewing the page, but you cannot get any information, it's possible because the you're detached from the webpage.
Reply sorry and ask user to refresh webpage, so you can get information from webpage.`;
    return await this.chatCompletion([
      new ChatMessage({ role: "system", content: prompt }),
      new ChatMessage({
        role: "user",
        content: `explain in ${this.language}:`,
      }),
    ]);
  }

  async summary(args: object, messages: ChatMessage[]): Promise<ThinkResult> {
    const content = await get_content();
    if (!content) return this.handleCannotGetContentError();

    const maxContentLength = 100 * 1024;
    const textContent =
      content.text.length > maxContentLength
        ? content.text.slice(0, maxContentLength)
        : content.text;

    const prompt = `You're an assistant and good at summarization,
Please summarize the content in: ${this.language}, and consider the language of user input.
The output should be short & clear, and in markdown format, if it need be diagram, please use mermaid format.
The user is reading an article: ${content.title}.
The content text is: ${textContent}
The links are: ${JSON.stringify(content.links)}`;

    const userInput = this.get(
      args,
      "userInput",
      `please summary the content in ${this.language}`,
    );
    const screenshot = this.getCurrentEnvironment().screenshot;
    const replaceUserInput = this.enableMultimodal
      ? imageContent(userInput, screenshot)
      : textContent(userInput);
    return await this.chatCompletion(messages, prompt, replaceUserInput, true);
  }

  private get(args: object, key: string, defaultValue: string): string {
    const value = args[key];
    if (!value) return defaultValue;
    return value;
  }

  /**
   * Generate text content for user
   * @param {object} args - Arguments
   * @param {ChatMessage[]} messages - Messages
   * @returns {Promise<any>} ChatCompletion
   */
  async generate_text(
    args: object,
    messages: ChatMessage[],
  ): Promise<ThinkResult> {
    const userInput = args["userInput"];
    const content = await get_content();
    const prompt = `You're a good writer provided by GluonMeson,
when user input: ${userInput}.
the webpage text: ${content.text}.
Please help user to beautify or complete the text with Markdown format.`;

    return await this.chatCompletion([
      new ChatMessage({ role: "system", content: prompt }),
      new ChatMessage({
        role: "user",
        content: `please generate text in ${this.language}:`,
      }),
    ]);
  }

  /**
   * Describe the current environment
   * @returns {Environment} Environment description
   */
  async environment(): Promise<Environment> {
    const screenshot = this.enableMultimodal
      ? await this.getScreenshot()
      : undefined;
    const content = await get_content();
    const maxContentLength = 100 * 1024;
    if (content) {
      const textContent =
        content.text.length > maxContentLength
          ? content.text.slice(0, maxContentLength)
          : content.text;
      return {
        systemPrompt: `As an assistant or chrome copilot provided by GluonMeson, named Guru Mason.
You're an assistant and good at data extraction, data analysis, summarization, wikipedia, and many kinds of internet tools.
Please decide to call different tools or directly answer questions in ${this.language}, and consider the language of user input, should not add assistant in answer.
Output format should be in markdown format, and use mermaid format for diagram generation.
Current user is viewing the page: ${content.title}, the url is ${content.url}, the content is:
${textContent}.
The links are: ${JSON.stringify(content.links)}`,
        screenshot,
      };
    } else {
      return { systemPrompt: this.getInitialSystemMessage(), screenshot };
    }
  }

  private async getScreenshot(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      chrome.tabs.captureVisibleTab(null, (dataUrl) => {
        resolve(dataUrl);
      });
    });
  }

  getInitialSystemMessage(): string {
    return `As an assistant or chrome copilot provided by GluonMeson, named Guru Mason.
You can decide to call different tools or directly answer questions in ${this.language}, should not add assistant in answer.
Output format should be in markdown format, and use mermaid format for diagram generation.`;
  }
}

export default GluonMesonAgent;
