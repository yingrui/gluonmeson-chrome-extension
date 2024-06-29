import OpenAI from "openai";
import Tool from "./Tool";

interface Agent {
  /**
   * Get tools that the agent can use
   * @returns {Tool[]} Tools
   */
  getTools(): Tool[];

  /**
   * Think
   * @param {ChatMessage[]} messages - Conversation messages
   * @returns {Choice[]} Choices
   */
  plan(messages: ChatMessage[]): Promise<Choice[]>;

  /**
   * Tracking dialogue state
   * @param {Choice[]} choices - Choices
   * @param {ChatMessage[]} messages - Messages
   * @returns {Promise<ToolCall[]>} ToolCalls
   */
  trackingDialogueState(choices: Choice[], messages: ChatMessage[]): ToolCall[];

  /**
   * Execute
   * @param {string} action - Åction
   * @param {object} args - Arguments
   * @param {ChatMessage[]} messages - Messages
   * @returns {Promise<any>} ChatCompletion
   */
  execute(action: string, args: object, messages: ChatMessage[]): Promise<any>;

  /**
   * Chat with user
   * @param {ChatMessage[]} messages - Chat messages
   * @returns {Promise<any>} ChatCompletion
   * @async
   */
  chat(messages: ChatMessage[]): Promise<any>;

  /**
   * Describe the current environment
   * @returns {string} Environment description
   */
  environment(): Promise<string>;
}

abstract class ThoughtAgent implements Agent {
  modelName: string;
  toolsCallModel: string;
  client: OpenAI;
  tools: Tool[] = [];

  constructor(modelName: string, toolsCallModel: string, client: OpenAI) {
    this.modelName = modelName;
    this.toolsCallModel = toolsCallModel;
    this.client = client;
  }

  /**
   * Implement interface method, return tools that the agent can use
   * @returns {Tool[]} Tools
   */
  getTools(): Tool[] {
    return this.tools;
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
  abstract execute(
    action: string,
    args: object,
    messages: ChatMessage[],
  ): Promise<any>;

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
