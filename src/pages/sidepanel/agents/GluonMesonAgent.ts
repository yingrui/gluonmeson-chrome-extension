import OpenAI from "openai";
import AgentWithTools from "./AgentWithTools";

import { get_content } from "@pages/sidepanel/utils";
import { stringToAsyncIterator } from "@pages/sidepanel/utils/streaming";

/**
 * GluonMeson Agent
 * @extends {AgentWithTools} - Agent with tools
 */
class GluonMesonAgent extends AgentWithTools {
  toolsCallModel: string = null;
  mapToolsAgents = {};
  chatCompletionTools: OpenAI.Chat.Completions.ChatCompletionTool[] = [];
  commands = [
    { value: "ask_page", label: "/ask_page" },
    { value: "generate_story", label: "/generate_story" },
    { value: "generate_test", label: "/generate_test" },
    { value: "google", label: "/google" },
    { value: "summary", label: "/summary" },
    { value: "translate", label: "/translate" },
    { value: "tasking", label: "/tasking" },
  ];

  constructor(
    defaultModelName,
    toolsCallModel,
    client,
    language,
    agents: AgentWithTools[] = [],
  ) {
    super(defaultModelName, toolsCallModel, client, language);

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
  private addAgent(agent: AgentWithTools): void {
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
      "help",
      "Answer what can GluonMeson Chrome Extension do. The user might ask like: what can you do, or just say help.",
      ["question"],
    );
    this.addTool(
      "generate_text",
      "Based on user input, generate text content for user.",
      ["userInput"],
    );
    for (const tool of this.getTools()) {
      const toolCall = tool.getFunction();
      this.chatCompletionTools.push(toolCall);
      this.mapToolsAgents[toolCall.function.name] = this;
    }
  }

  /**
   * Get the command options
   * Commands are defined in field this.commands, eg.: ask_page, summary, translate, trello, help
   * @returns {object[]} Command options
   */
  public getCommandOptions(): object[] {
    return [...this.commands]; // clone commands
  }

  /**
   * Execute the command
   * 1. If the command is help, call the help function
   * 2. If the command is not help, throw an error
   * @param {string} command - Command
   * @param {object} args - Arguments
   * @param {ChatMessage[]} messages - Messages
   * @returns {Promise<any>} ChatCompletion
   * @async
   * @throws {Error} Unexpected tool call in GluonMesonAgent: {command}
   */
  async executeAction(
    action: string,
    args: object,
    messages: ChatMessage[] = [],
  ): Promise<any> {
    const agent = this.mapToolsAgents[action];
    if (agent) {
      return agent.execute(action, args, messages);
    } else {
      throw new Error("Unexpected tool call in GluonMesonAgent: " + command);
    }
  }

  /**
   * Answer what can GluonMeson Chrome Extension do
   * 1. List all the tools
   * 2. Ask GPT model to introduce the tools
   * @param {object} args - Arguments
   * @param {ChatMessage[]} messages - Messages
   * @returns {Promise<any>} ChatCompletion
   */
  async help(args: object, messages: ChatMessage[]): Promise<any> {
    const question = args["question"] ?? "";
    console.log(question);
    const helpText = `As your GluonMeson Chrome Copilot, Guru Mason, I can assist you with a variety of tasks to enhance your browsing and productivity experience. Here’s how I can help you:

* **Ask Page**: I can answer questions based on the content of the current webpage you are viewing. This is particularly useful for research and learning.
* **Summary**: If you're looking at a lengthy article or document, I can generate a concise summary to save you time.
* **Google Search**: I can perform Google searches for you, providing information and answers directly related to your queries.
* **Translate**: I offer translation services for content, with a focus on Chinese and English, to help overcome language barriers.
* **Generate Story**: I can help you craft narratives or story content which is especially useful when you want to create compelling presentations or content.
* **Tasking**: If you’re managing a project, I can assist you in breaking down tasks for a story in a storyboard, especially when you are browsing a story card page.
* **Generate Test**: For developers, I can generate end-to-end test scripts based on the current webpage, aiding in webpage testing and development.
* **Generate Text**: I can help generate text content based on your input, useful for drafting emails, reports, or any general writing tasks.

Feel free to ask for help with any of these services at any time!`;

    if (!question) {
      return stringToAsyncIterator(helpText);
    }

    const prompt = `You're an assistant or chrome copilot provided by GluonMeson, Guru Mason is your name.
There are tools you can use:
${helpText}
When user asked ${question}, please tell user what you can do for them.`;

    return await this.chatCompletion([
      { role: "system", content: prompt },
      {
        role: "user",
        content: `please tell user what you can do for them in ${this.language}:`,
      },
    ]);
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
    const maxContentLength = 2048;
    const textContent =
      content.text.length > maxContentLength
        ? content.text.slice(0, maxContentLength)
        : content.text;
    if (content) {
      return `As an assistant or chrome copilot provided by GluonMeson, named Guru Mason. Here’s how you can help users:

* Ask Page: you can answer questions based on the content of the current webpage you are viewing. This is particularly useful for research and learning.
* Summary: If user is looking at a lengthy article or document, you can generate a concise summary to save you time.
* Google Search: you can perform Google searches for you, providing information and answers directly related to user's queries.
* Translate: you offer translation services for content, with a focus on Chinese and English, to help overcome language barriers.
* Generate Story: you can help you craft narratives or story content which is especially useful when you want to create compelling presentations or content.
* Tasking: If user is managing a project, you can assist user in breaking down tasks for a story in a storyboard, especially when user us browsing a story card page.
* Generate Test: For developers, you can generate end-to-end test scripts based on the current webpage, aiding in webpage testing and development.
* Generate Text: you can help generate text content based on user input, useful for drafting emails, reports, or any general writing tasks.

Please decide to call different tools or directly answer questions in ${this.language}, should not add assistant in answer.
Current user is viewing the page: ${content.title}, the url is ${content.url}, the content is:
${textContent}.`;
    } else {
      return this.getInitialSystemMessage();
    }
  }

  /**
   * Handle the chat messages
   * 1. Get the last user input from the chat messages
   * 2. Parse the command from the user input
   * 3. If the command is found, execute the command
   * 4. If the command is not found and tools call model is specified, call the tool
   * 5. If the tool call model is not specified, return the chat completion
   * @param {ChatMessage[]} messages - Chat messages
   * @returns {Promise<any>} ChatCompletion
   * @async
   */
  async chat(messages: ChatMessage[]): Promise<any> {
    const [command, userInput] = this.parseCommand(
      messages.slice(-1)[0].content, // Get the last user input from the chat messages
    );

    if (this.commands.find((c) => c.value === command)) {
      const agent = this.mapToolsAgents[command];
      return agent.executeCommandWithUserInput(command, userInput, messages);
    } else {
      return super.chat(messages);
    }
  }

  getInitialSystemMessage(): string {
    return `As an assistant or chrome copilot provided by GluonMeson, named Guru Mason. Here’s how you can help users:

* Ask Page: you can answer questions based on the content of the current webpage you are viewing. This is particularly useful for research and learning.
* Summary: If user is looking at a lengthy article or document, you can generate a concise summary to save you time.
* Google Search: you can perform Google searches for you, providing information and answers directly related to user's queries.
* Translate: you offer translation services for content, with a focus on Chinese and English, to help overcome language barriers.
* Generate Story: you can help you craft narratives or story content which is especially useful when you want to create compelling presentations or content.
* Tasking: If user is managing a project, you can assist user in breaking down tasks for a story in a storyboard, especially when user us browsing a story card page.
* Generate Test: For developers, you can generate end-to-end test scripts based on the current webpage, aiding in webpage testing and development.
* Generate Text: you can help generate text content based on user input, useful for drafting emails, reports, or any general writing tasks.

You can decide to call different tools or directly answer questions in ${this.language}, should not add assistant in answer.`;
  }

  /**
   * Get initial messages
   * @returns {ChatMessage[]} Initial messages
   */
  getInitialMessages(): ChatMessage[] {
    return [
      {
        role: "system",
        content: this.getInitialSystemMessage(),
      },
      { role: "assistant", content: "Hello! How can I assist you today?" },
    ];
  }

  /**
   * Parse the command from the user input
   * If the user input starts with /{command}, return the command and the user input
   * If the user input does not starts with /{command}, return command ('chat') and the user input
   * @param {string} userInput - input
   * @returns {[string, string]} - Command and user input
   */
  private parseCommand(userInput: string): [string, string] {
    const matchedCommand = this.commands.find((command) =>
      userInput.match(new RegExp(`(?:^|\\s)/${command.value}\\s+`)),
    );

    if (matchedCommand) {
      // Use regex group match to extract the input after the command
      const input = userInput.match(
        new RegExp(`(?:^|\\s)/${matchedCommand.value}\\s+(.*)`),
      )[1];
      return [matchedCommand.value, input];
    }
    return ["chat", userInput];
  }
}

export default GluonMesonAgent;
