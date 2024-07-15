import OpenAI from "openai";
import Tool from "./Tool";
import Agent from "./Agent";
import { stringToAsyncIterator } from "../utils/streaming";

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
   * Choose the tool agent to execute the tool
   * @param {ChatMessage[]} messages - Chat messages
   * @returns {Promise<any>} ChatCompletion
   * @async
   */
  async chat(messages: ChatMessage[]): Promise<any> {
    const actions = await this.plan(messages);
    return this.execute(actions, messages);
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
   * Think
   * @param {ChatMessage[]} messages - Conversation messages
   * @returns {Promise<Action[]>} Actions
   */
  async plan(messages: ChatMessage[]): Promise<Action[]> {
    const env = await this.environment();
    const systemMessage = { role: "system", content: env } as ChatMessage;
    const messagesWithEnv = env
      ? [systemMessage, ...messages.slice(1)]
      : messages;

    const toolCalls = this.getToolCalls();
    const choices = await this.toolsCall(messagesWithEnv, toolCalls);
    if (choices.length > 0) {
      const choice = choices[0];
      if (choice.finish_reason === "tool_calls") {
        const tools = choice.message.tool_calls;
        if (tools) {
          return tools.map((t) => this.toAction(t));
        }
      } else if (choice.finish_reason === "stop" && choice.message.content) {
        return [this.replyAction(choice.message.content)];
      }
    }
    return [];
  }

  /**
   * Tracking dialogue state, should be invoked in execute method, before actions are executed
   * @param {Action[]} actions - Actions
   * @param {ChatMessage[]} messages - Messages
   * @returns {Action[]} Actions
   */
  trackingDialogueState(actions: Action[], messages: ChatMessage[]): Action[] {
    // TODO: Implement tracking dialogue state
    if (actions.length === 0) {
      return [this.chatAction(messages[messages.length - 1].content)];
    }
    return actions;
  }

  /**
   * Execute
   * @param {Action[]} actions - Actions
   * @param {ChatMessage[]} messages - Messages
   * @returns {Promise<any>} ChatCompletion
   */
  async execute(actions: Action[], messages: ChatMessage[]): Promise<any> {
    const refinedActions = this.trackingDialogueState(actions, messages);

    // TODO: support multiple actions in future
    const action = refinedActions[0].name;
    const args = refinedActions[0].arguments;

    if (action === "chat") {
      return this.chatCompletion(messages, "", args["userInput"]);
    }

    if (action === "reply") {
      return stringToAsyncIterator(args["content"]);
    }

    for (const member of this.getMemberOfSelf()) {
      if (member === action && typeof this[member] === "function") {
        // TODO: need to verify if arguments of function are correct
        return this[member].apply(this, [args, messages]);
      }
    }

    return this.executeAction(action, args, messages);
  }

  private getMemberOfSelf(): string[] {
    return Object.getOwnPropertyNames(Object.getPrototypeOf(this));
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

  private toAction(tool: ToolCall): Action {
    let args = {};
    try {
      if (tool.function.arguments) {
        args = JSON.parse(tool.function.arguments);
      }
    } catch (e) {
      console.error("Error parsing tool arguments", e);
      console.error("tool.function.arguments", tool.function.arguments);
    }
    return { name: tool.function.name, arguments: args } as Action;
  }

  private replyAction(content: string): Action {
    return { name: "reply", arguments: { content } } as Action;
  }

  private chatAction(userInput: string): Action {
    return { name: "chat", arguments: { userInput } } as Action;
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