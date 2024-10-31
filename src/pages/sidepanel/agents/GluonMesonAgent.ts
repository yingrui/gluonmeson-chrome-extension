import OpenAI from "openai";
import ThoughtAgent from "@src/shared/agents/ThoughtAgent";
import Conversation from "@src/shared/agents/Conversation";
import _ from "lodash";

import { get_content } from "@src/shared/utils";
import { stringToAsyncIterator } from "@src/shared/utils/streaming";

/**
 * GluonMeson Agent
 * @extends {ThoughtAgent} - Agent with tools
 */
class GluonMesonAgent extends ThoughtAgent {
  toolsCallModel: string = null;
  mapToolsAgents = {};
  chatCompletionTools: OpenAI.Chat.Completions.ChatCompletionTool[] = [];

  constructor(
    defaultModelName,
    toolsCallModel,
    client,
    language,
    agents: ThoughtAgent[] = [],
    conversation: Conversation = new Conversation(),
  ) {
    super(
      defaultModelName,
      toolsCallModel,
      client,
      language,
      "Guru",
      "Guru, your browser assistant",
      conversation,
    );

    this.addSelfAgentTools();
    for (const agent of agents) {
      this.addAgent(agent);
    }

    this.toolsCallModel = toolsCallModel;
  }

  /**
   * Add the agent
   * 1. Add agent tools to the chat completion tools
   * 2. Map the tools agents
   * @constructor
   * @param {any} agent - Agent
   * @returns {void}
   */
  private addAgent(agent: ThoughtAgent): void {
    for (const tool of agent.getTools()) {
      this.getTools().push(tool);
      const toolCall = tool.getFunction();
      this.chatCompletionTools.push(toolCall);
      this.mapToolsAgents[toolCall.function.name] = agent;
    }
  }

  /**
   * Add the self agent tools to chatCompletionTools and mapToolsAgents.
   */
  private addSelfAgentTools(): void {
    this.addTool(
      "summary",
      "Based on current web page content, answer user's question or follow the user instruction to generate content for them.",
      ["userInput", "task"],
    );
    for (const tool of this.getTools()) {
      const toolCall = tool.getFunction();
      this.chatCompletionTools.push(toolCall);
      this.mapToolsAgents[toolCall.function.name] = this;
    }
  }

  /**
   * Execute the command
   * 1. If the command is help, call the help function
   * 2. If the command is not help, throw an error
   * @param {string} command - Command
   * @param {object} args - Arguments
   * @param {Conversation} conversation - Conversation
   * @returns {Promise<any>} ChatCompletion
   * @async
   * @throws {Error} Unexpected action in GluonMesonAgent: {action}
   */
  async executeAction(
    action: string,
    args: object,
    conversation: Conversation,
  ): Promise<any> {
    const agent = this.mapToolsAgents[action];
    if (agent) {
      return agent.execute([{ name: action, arguments: args }], conversation);
    } else {
      throw new Error("Unexpected action in GluonMesonAgent: " + action);
    }
  }

  async summary(args: object, messages: ChatMessage[]) {
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
The content text is: ${content.text}
The links are: ${JSON.stringify(content.links)}`;

    return await this.chatCompletion(
      messages,
      prompt,
      this.get(
        args,
        "userInput",
        `please summary the content in ${this.language}`,
      ),
    );
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
  async generate_text(args: object, messages: ChatMessage[]): Promise<any> {
    const userInput = args["userInput"];
    const content = await get_content();
    const prompt = `You're a good writer provided by GluonMeson,
when user input: ${userInput}.
the webpage text: ${content.text}.
Please help user to beautify or complete the text with Markdown format.`;

    return await this.chatCompletion([
      { role: "system", content: prompt },
      { role: "user", content: `please generate text in ${this.language}:` },
    ]);
  }

  /**
   * Describe the current environment
   * @returns {string} Environment description
   */
  async environment(): Promise<string> {
    const content = await get_content();
    const maxContentLength = 100 * 1024;
    if (content) {
      const textContent =
        content.text.length > maxContentLength
          ? content.text.slice(0, maxContentLength)
          : content.text;
      return `As an assistant or chrome copilot provided by GluonMeson, named Guru Mason.
You're an assistant and good at data extraction, data analysis, summarization, wikipedia, and many kinds of internet tools.
Please decide to call different tools or directly answer questions in ${this.language}, and consider the language of user input, should not add assistant in answer.
Output format should be in markdown format, and use mermaid format for diagram generation.
Current user is viewing the page: ${content.title}, the url is ${content.url}, the content is:
${textContent}.
The links are: ${JSON.stringify(content.links)}`;
    } else {
      return this.getInitialSystemMessage();
    }
  }

  getInitialSystemMessage(): string {
    return `As an assistant or chrome copilot provided by GluonMeson, named Guru Mason.
You can decide to call different tools or directly answer questions in ${this.language}, should not add assistant in answer.
Output format should be in markdown format, and use mermaid format for diagram generation.`;
  }
}

export default GluonMesonAgent;
