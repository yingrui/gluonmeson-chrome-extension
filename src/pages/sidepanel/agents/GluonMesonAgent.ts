import OpenAI from "openai";
import Tool from "./tool";
import AgentWithTools from "./AgentWithTools";
import TrelloAgent from "./TrelloAgent";
import SummaryAgent from "./SummaryAgent";
import TranslateAgent from "./TranslateAgent";
import GoogleAgent from "./GoogleAgent";
import configureStorage from "@root/src/shared/storages/gluonConfig";

let defaultModelName = "gpt-3.5-turbo";
let toolsCallModel: string = null;
let client: OpenAI;
configureStorage.get().then((config) => {
  client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
    dangerouslyAllowBrowser: true,
  });
  defaultModelName = config.defaultModel
    ? config.defaultModel
    : defaultModelName;
  toolsCallModel = config.toolsCallModel
    ? config.toolsCallModel
    : toolsCallModel;
});

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
    "help",
  ];

  constructor() {
    super(defaultModelName, client);
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

    this.addAgent(new SummaryAgent(this.modelName, this.client));
    this.addAgent(new GoogleAgent(this.modelName, this.client));
    this.addAgent(new TranslateAgent(this.modelName, this.client));
    this.addAgent(new TrelloAgent(this.modelName, this.client));
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
    const prompt = `You're an assistant provided by GluonMeson, when user asked ${question}.
Please tell user what you can do for them. There are tools:
${tools}`;

    return await this.chatCompletion([{ role: "system", content: prompt }]);
  }

  /**
   * Generate text content for user
   * @param {string} userInput - User input
   * @returns {Promise<any>} ChatCompletion
   */
  async generate_text(userInput: string): Promise<any> {
    const content = await this.get_content();
    const prompt = `You're a good writer provided by GluonMeson,
when user input: ${userInput}.
the webpage text: ${content.text}.
Please help user to beautify or complete the text with Markdown format.`;

    return await this.chatCompletion([{ role: "system", content: prompt }]);
  }

  private async get_content(): Promise<any> {
    return new Promise<any>(function (resolve, reject) {
      // send message to content script, call resolve() when received response"
      chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { type: "get_content" },
          (response) => {
            resolve(response);
          },
        );
      });
    });
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
    const chatCompletion = await this.toolsCall(
      this.toolsCallModel,
      messages,
      this.chatCompletionTools,
    );

    const tool_calls = chatCompletion.choices[0].message.tool_calls;
    if (tool_calls) {
      for (const tool of tool_calls) {
        const agent = this.mapToolsAgents[tool.function.name];
        return agent.execute(tool);
      }
    }

    return this.chatCompletion(messages);
  }

  /**
   * Find the agent to execute the tool
   * 1. Get the agent from the mapToolsAgents
   * 2. Execute the command with the agent
   * @param {string} toolName - Tool name
   * @param {any} args - Arguments
   * @returns {Promise<any>} ChatCompletion
   * @async
   */
  async findAgentToExecute(toolName: string, args: any): Promise<any> {
    const agent = this.mapToolsAgents[toolName];
    return agent.executeCommand(toolName, args);
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
      return agent.executeCommandWithUserInput(command, userInput);
    } else {
      if (toolsCallModel) {
        return this.callTool(messages);
      } else {
        return this.chatCompletion(messages);
      }
    }
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
