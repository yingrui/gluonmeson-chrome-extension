import OpenAI from "openai";
import Tool from "./tool";

/**
 * Agent with tools
 */
abstract class AgentWithTools {
  modelName: string;
  client: OpenAI;
  language: string;
  tools: Tool[] = [];

  constructor(defaultModelName: string, client: OpenAI, language: string) {
    this.modelName = defaultModelName;
    this.client = client;
    this.language = language;
  }

  /**
   * Add tool
   * 1. Create a new tool with given name and description
   * 2. Add string parameters to the tool
   * 3. Set user input as argument, so agent can understand that user input could be which parameter
   *    - If there are more than one string parameters, and user input as argument is not given, set the first one as user input as argument
   *    - If user input as argument is given, set it as user input as argument
   *    eg. when user types "/ask_page xxx", agent should understand the user input (xxx) is the parameter "question"
   * 4. At last add tool to the tools
   * @param {string} name - Name of the tool
   * @param {string} description - Description of the tool
   * @param {string[]} stringParameters - String parameters
   * @param {string} userInputAsArgument - User input as argument
   * @returns {void}
   */
  public addTool(
    name: string,
    description: string,
    stringParameters: string[],
    userInputAsArgument: string = null,
  ): void {
    const tool = new Tool(name, description);
    for (const stringParameter of stringParameters) {
      tool.addStringParameter(stringParameter);
    }

    if (stringParameters.length > 0 && userInputAsArgument === null) {
      tool.setUserInputAsArgument(stringParameters[0]);
    } else if (userInputAsArgument) {
      tool.setUserInputAsArgument(userInputAsArgument);
    }
    this.tools.push(tool);
  }

  /**
   * Get tools
   * @returns {OpenAI.Chat.Completions.ChatCompletionTool[]} Tools
   */
  getTools(): OpenAI.Chat.Completions.ChatCompletionTool[] {
    return this.tools.map((tool) => tool.getFunction());
  }

  /**
   * Execute
   * 1. Execute the tool
   * 2. Parse the tool arguments
   * @param {OpenAI.Chat.Completions.ChatCompletionMessageToolCall} tool - Tool
   * @returns {Promise<any>} ChatCompletion
   * @throws {Error} Unexpected tool call, or error parsing tool arguments
   */
  async execute(
    tool: OpenAI.Chat.Completions.ChatCompletionMessageToolCall,
  ): Promise<any> {
    let args = {};
    try {
      if (tool.function.arguments) {
        args = JSON.parse(tool.function.arguments);
      }
    } catch (e) {
      console.error("Error parsing tool arguments", e);
      console.error("tool.function.arguments", tool.function.arguments);
    }
    return this.executeCommand(tool.function.name, args);
  }

  /**
   * Execute command with user input.
   * The user input should be set to object args, need to figure out which parameter is the user input.
   * @param {string} command - Command
   * @param {string} userInput - User input
   * @returns {Promise<any>} ChatCompletion
   * @throws {Error} Unexpected tool call
   */
  async executeCommandWithUserInput(
    command: string,
    userInput: string,
  ): Promise<any> {
    const args = {};
    // Find the tool with the given command
    for (const tool of this.tools) {
      if (tool.name === command) {
        // Set the user input as an argument
        args[tool.userInputAsArgument] = userInput;
        break;
      }
    }
    return this.executeCommand(command, args);
  }

  /**
   * Execute command
   * @param {string} command - Command
   * @param {object} args - Pojo object as Arguments
   * @returns {Promise<any>} ChatCompletion
   * @abstract
   */
  abstract executeCommand(command: string, args: object): Promise<any>;

  /**
   * Chat completion
   * @param {OpenAI.Chat.Completions.ChatCompletionMessageParam[]} messages - Messages
   * @param {bool} stream - Stream
   * @returns {Promise<any>} ChatCompletion
   */
  async chatCompletion(
    messages: OpenAI.ChatCompletionMessageParam[],
    stream: boolean = true,
  ): Promise<any> {
    return await this.client.chat.completions.create({
      messages: messages,
      model: this.modelName,
      stream: stream,
      max_tokens: 4096,
    });
  }

  /**
   * Tools call
   * @param {string} toolsCallModel - Tools call model
   * @param {OpenAI.Chat.Completions.ChatCompletionMessageParam[]} messages - Messages
   * @param {OpenAI.Chat.Completions.ChatCompletionTool[]} tools - Tools
   * @returns {Promise<any>} ChatCompletion
   */
  async toolsCall(
    toolsCallModel: string,
    messages: OpenAI.ChatCompletionMessageParam[],
    tools: OpenAI.Chat.Completions.ChatCompletionTool[],
  ): Promise<any> {
    return await this.client.chat.completions.create({
      model: toolsCallModel,
      messages: messages,
      stream: false,
      tools: tools,
      max_tokens: 4096,
    });
  }
}

export default AgentWithTools;
