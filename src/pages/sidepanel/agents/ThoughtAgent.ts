import OpenAI from "openai";
import Tool from "./Tool";

interface Agent {
  /**
   * Think
   * @param {ChatMessage[]} messages - Conversation messages
   * @returns {Choice[]} Choices
   */
  plan(messages: ChatMessage[]): Promise<Choice[]>;

  /**
   * Get tools that the agent can use
   * @returns {Tool[]} Tools
   */
  getTools(): Tool[];
}

class ThoughtAgent implements Agent {
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
    const toolCalls = this.getToolCalls();
    return this.toolsCall(messages, toolCalls);
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
