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
   * @returns {Promise<ToolCall[] | string>} Choices
   */
  plan(messages: ChatMessage[]): Promise<ToolCall[] | string>;

  /**
   * Tracking dialogue state
   * @param {ToolCall[]} tools - ToolCalls
   * @param {ChatMessage[]} messages - Messages
   * @returns {ToolCall[]} ToolCalls
   */
  trackingDialogueState(tools: ToolCall[], messages: ChatMessage[]): ToolCall[];

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

export default Agent;
