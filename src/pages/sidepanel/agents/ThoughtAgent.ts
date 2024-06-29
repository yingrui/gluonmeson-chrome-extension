import OpenAI from "openai";
import Tool from "./Tool";
import Agent from "./Agent";

class ThoughtAgent implements Agent {
  modelName: string;
  toolsCallModel: string;
  client: OpenAI;
  language: string;
  tools: Tool[] = [];

  constructor(
    modelName: string,
    toolsCallModel: string,
    client: OpenAI,
    language: string,
  ) {
    this.modelName = modelName;
    this.toolsCallModel = toolsCallModel;
    this.client = client;
    this.language = language;
  }

  /**
   * Implement interface method, return tools that the agent can use
   * @returns {Tool[]} Tools
   */
  getTools(): Tool[] {
    return this.tools;
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
   * @returns {void}
   */
  addTool(name: string, description: string, stringParameters: string[]): Tool {
    const tool = new Tool(name, description);
    for (const stringParameter of stringParameters) {
      tool.addStringParameter(stringParameter);
    }

    this.getTools().push(tool);
    return tool;
  }

  /**
   * Get tool calls
   * @returns {OpenAI.Chat.Completions.ChatCompletionTool[]} ChatCompletionTools
   */
  getToolCalls(): OpenAI.Chat.Completions.ChatCompletionTool[] {
    return this.getTools().map((tool) => tool.getFunction());
  }

  /**
   * Think
   * @param {ChatMessage[]} messages - Conversation messages
   * @returns {Choice[]} Choices
   */
  async plan(messages: ChatMessage[]): Promise<Choice[]> {
    const env = await this.environment();
    const systemMessage = { role: "system", content: env } as ChatMessage;
    const messagesWithEnv = env
      ? [systemMessage, ...messages.slice(1)]
      : messages;

    const toolCalls = this.getToolCalls();
    return this.toolsCall(messagesWithEnv, toolCalls);
  }

  /**
   * Tracking dialogue state
   * @param {Choice[]} choices - Choices
   * @param {ChatMessage[]} messages - Messages
   * @returns {Promise<ToolCall[]>} ToolCalls
   */
  trackingDialogueState(
    choices: Choice[],
    messages: ChatMessage[],
  ): ToolCall[] {
    if (choices.length > 0) {
      if (choices[0].finish_reason === "tool_calls") {
        const tool_calls = choices[0].message.tool_calls;
        if (tool_calls) {
          return tool_calls;
        }
      } else if (choices[0].message.content) {
        // TODO: should return message content as a tool call
        return [];
      }
    }
    // TODO: Implement tracking dialogue state
    return [];
  }

  /**
   * Choose the tool agent to execute the tool
   * @param {ChatMessage[]} messages - Chat messages
   * @returns {Promise<any>} ChatCompletion
   * @async
   */
  async chat(messages: ChatMessage[]): Promise<any> {
    const choices = await this.plan(messages);
    const toolCallArray = this.trackingDialogueState(choices, messages);

    if (toolCallArray.length === 0) {
      return this.chatCompletion(messages);
    }

    for (const tool of toolCallArray) {
      const action = tool.function.name;
      return this.execute(action, this.parseArguments(tool), messages);
    }
    throw new Error("Unexpected choice: " + JSON.stringify(choices[0]));
  }

  private parseArguments(tool: ToolCall): object {
    let args = {};
    try {
      if (tool.function.arguments) {
        args = JSON.parse(tool.function.arguments);
      }
    } catch (e) {
      console.error("Error parsing tool arguments", e);
      console.error("tool.function.arguments", tool.function.arguments);
    }
    return args;
  }

  /**
   * Execute
   * @param {string} action - Action
   * @param {object} args - Arguments
   * @param {ChatMessage[]} messages - Messages
   * @returns {Promise<any>} ChatCompletion
   */
  async execute(
    action: string,
    args: object,
    messages: ChatMessage[],
  ): Promise<any> {
    for (const member of Object.getOwnPropertyNames(
      Object.getPrototypeOf(this),
    )) {
      if (member === action && typeof this[member] === "function") {
        // TODO: need to verify if arguments of function are correct
        return this[member].apply(this, [args, messages]);
      }
    }

    return this.executeAction(action, args, messages);
  }

  /**
   * Execute command
   * @param {string} action - Action
   * @param {object} args - Pojo object as Arguments
   * @param {ChatMessage[]} messages - Messages
   * @returns {Promise<any>} ChatCompletion
   */
  async executeAction(
    action: string,
    args: object,
    messages: ChatMessage[],
  ): Promise<any> {
    throw new Error("Unimplemented action: " + action);
  }

  /**
   * Describe the current environment
   * @returns {string} Environment description
   */
  async environment(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      resolve("");
    });
  }

  /**
   * Chat completion
   * @param {ChatMessage[]} messages - Messages
   * @param {bool} stream - Stream
   * @returns {Promise<any>} ChatCompletion
   */
  async chatCompletion(
    messages: ChatMessage[],
    systemPrompt: string = "",
    replaceUserInput: string = "",
    stream: boolean = true,
  ): Promise<any> {
    if (systemPrompt && messages.length > 0 && messages[0].role === "system") {
      const systemMessage = {
        role: "system",
        content: systemPrompt,
      } as ChatMessage;
      messages = [systemMessage, ...messages.slice(1)];
    }

    if (
      replaceUserInput &&
      messages.length > 1 &&
      messages[messages.length - 1].role === "user"
    ) {
      const userMessage = {
        role: "user",
        content: replaceUserInput,
      } as ChatMessage;
      messages = [...messages.slice(0, messages.length - 1), userMessage];
    }

    return await this.client.chat.completions.create({
      messages: messages as OpenAI.ChatCompletionMessageParam[],
      model: this.modelName,
      stream: stream,
      max_tokens: 4096,
    });
  }

  /**
   * Tools call
   * @param {ChatMessage[]} messages - Messages
   * @param {OpenAI.Chat.Completions.ChatCompletionTool[]} tools - Tools
   * @returns {Promise<Choice[]>}
   */
  private async toolsCall(
    messages: ChatMessage[],
    tools: OpenAI.Chat.Completions.ChatCompletionTool[],
  ): Promise<Choice[]> {
    const chatCompletion = await this.client.chat.completions.create({
      model: this.toolsCallModel,
      messages: messages as OpenAI.ChatCompletionMessageParam[],
      stream: false,
      tools: tools,
      max_tokens: 4096,
      logprobs: false, // Log probability information for the choice.
    });
    return chatCompletion.choices as Choice[];
  }
}

export default ThoughtAgent;
