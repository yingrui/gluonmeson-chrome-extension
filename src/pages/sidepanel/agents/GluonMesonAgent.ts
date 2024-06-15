import OpenAI from "openai";
import Tool from "./tool";
import AgentWithTools from "./AgentWithTools";

import { get_content } from "@pages/sidepanel/utils";

/**
 * GluonMeson Agent
 * @extends {AgentWithTools} - Agent with tools
 */
class GluonMesonAgent extends AgentWithTools {
  toolsCallModel: string = null;
  mapToolsAgents = {};
  chatCompletionTools: OpenAI.Chat.Completions.ChatCompletionTool[] = [];
  commands = [
    "ask_page",
    "google",
    "summary",
    "translate",
    "generate_story",
    "tasking",
    "help",
  ];

  constructor(
    defaultModelName,
    toolsCallModel,
    client,
    language,
    agents: AgentWithTools[] = [],
  ) {
    super(defaultModelName, client, language);
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

    for (const agent of agents) {
      this.addAgent(agent);
    }
    this.addAgent(this);

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
      this.chatCompletionTools.push(tool);
      this.mapToolsAgents[tool.function.name] = agent;
    }
  }

  /**
   * Get the command options
   * Commands are defined in field this.commands, eg.: ask_page, summary, translate, trello, help
   * @returns {object[]} Command options
   */
  public getCommandOptions(): object[] {
    return this.commands.map((key) => {
      return {
        value: key,
        label: key,
      };
    });
  }

  /**
   * Execute the command
   * 1. If the command is help, call the help function
   * 2. If the command is not help, throw an error
   * @param {string} command - Command
   * @param {object} args - Arguments
   * @returns {Promise<any>} ChatCompletion
   * @async
   * @throws {Error} Unexpected tool call in GluonMesonAgent: {command}
   */
  async executeCommand(command: string, args: object): Promise<any> {
    if (command === "help") {
      return this.help(args["question"]);
    } else if (command === "generate_text") {
      return this.generate_text(args["userInput"]);
    }
    throw new Error("Unexpected tool call in GluonMesonAgent: " + command);
  }

  /**
   * Answer what can GluonMeson Chrome Extension do
   * 1. List all the tools
   * 2. Ask GPT model to introduce the tools
   * @param {string} question - User question
   * @returns {Promise<any>} ChatCompletion
   */
  async help(question: string): Promise<any> {
    const tools = this.chatCompletionTools
      .map(
        (t) =>
          `${t.function.name}: ${t.function.description}: ${t.function.parameters}`,
      )
      .join("\n");
    const prompt = `You're an assistant or chrome copilot provided by GluonMeson, Guru Mason is your name.
There are tools you can use:
${tools}
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
   * @param {string} userInput - User input
   * @returns {Promise<any>} ChatCompletion
   */
  async generate_text(userInput: string): Promise<any> {
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
   * Choose the tool agent to execute the tool
   * 1. Call the tool with the chat messages
   * 2. Get the tool_calls from the chat completion
   * 3. If the tool_calls exist, execute the tool
   * 4. If the tool_calls do not exist, return the chat completion
   * @param {ChatMessage[]} messages - Chat messages
   * @returns {Promise<any>} ChatCompletion
   * @async
   */
  async callTool(messages: ChatMessage[]): Promise<any> {
    // Reset system message, so the agent can understand the context
    const messagesWithWebpageContext =
      await this.updateSystemMessages(messages);
    try {
      const chatCompletion = await this.toolsCall(
        this.toolsCallModel,
        messagesWithWebpageContext,
        this.chatCompletionTools,
      );

      const tool_calls = chatCompletion.choices[0].message.tool_calls;
      if (tool_calls) {
        for (const tool of tool_calls) {
          const agent = this.mapToolsAgents[tool.function.name];
          return agent.execute(tool, messages);
        }
      }
    } catch (error) {
      console.error(error);
    }

    return this.chatCompletion(messagesWithWebpageContext);
  }

  /**
   * Update the system messages with current page information.
   * If the text content length is greater than 2048, slice the content.
   * @param {ChatMessage[]} messages - Chat messages
   * @returns {ChatMessage[]} Updated messages
   */
  private async updateSystemMessages(messages: ChatMessage[]): ChatMessage[] {
    // get all messages except the first system message
    const conversation = messages.slice(1);
    try {
      const content = await get_content();
      const textContent =
        content.text.length > 2048 ? content.text.slice(0, 2048) : content.text;
      const systemMessage = {
        role: "system",
        content: `You're an assistant or chrome copilot provided by GluonMeson, Guru Mason is your name.
The user is viewing the page: ${content.title}, the url is ${content.url}.
The page content is: ${content.text}.
Please direct answer questions in ${this.language}, should not add assistant in answer.`,
      };
      return [systemMessage, ...conversation];
    } catch (error) {
      console.error(error);
    }
    return messages;
  }

  /**
   * Find the agent to execute the tool
   * 1. Get the agent from the mapToolsAgents
   * 2. Execute the command with the agent
   * @param {string} toolName - Tool name
   * @param {any} args - Arguments
   * @param {ChatMessage[]} messages - Chat messages
   * @returns {Promise<any>} ChatCompletion
   * @async
   */
  async findAgentToExecute(
    toolName: string,
    args: any,
    messages: ChatMessage[],
  ): Promise<any> {
    const agent = this.mapToolsAgents[toolName];
    return agent.executeCommand(toolName, args, messages);
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

    if (this.commands.includes(command)) {
      const agent = this.mapToolsAgents[command];
      return agent.executeCommandWithUserInput(command, userInput, messages);
    } else {
      if (this.toolsCallModel) {
        return this.callTool(messages);
      } else {
        return this.chatCompletion(messages);
      }
    }
  }

  /**
   * Get initial messages
   * @returns {ChatMessage[]} Initial messages
   */
  getInitialMessages(): ChatMessage[] {
    return [
      {
        role: "system",
        content: `You're an assistant or chrome copilot provided by GluonMeson, Guru Mason is your name.
Please direct answer questions in ${this.language}, should not add assistant in answer.`,
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
    const matchedCommand = this.commands.find((commandKey) =>
      userInput.match(new RegExp(`(?:^|\\s)/${commandKey}\\s+`)),
    );

    if (matchedCommand) {
      // Use regex group match to extract the input after the command
      const input = userInput.match(
        new RegExp(`(?:^|\\s)/${matchedCommand}\\s+(.*)`),
      )[1];
      return [matchedCommand, input];
    }
    return ["chat", userInput];
  }
}

export default GluonMesonAgent;
