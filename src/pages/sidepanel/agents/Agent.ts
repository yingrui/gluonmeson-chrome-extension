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

export default Agent;
