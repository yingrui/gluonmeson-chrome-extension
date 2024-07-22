import Tool from "./Tool";
import Conversation from "./Conversation";

interface Agent {
  /**
   * Get tools that the agent can use
   * @returns {Tool[]} Tools
   */
  getTools(): Tool[];

  /**
   * Get conversation
   * @returns {Conversation} Conversation
   */
  getConversation(): Conversation;

  /**
   * Think
   * @param {ChatMessage[]} messages - Conversation messages
   * @returns {Promise<Action[]>} Actions
   */
  plan(messages: ChatMessage[]): Promise<Action[]>;

  /**
   * Tracking dialogue state, should be invoked in execute method, before actions are executed
   * @param {Action[]} actions - Actions
   * @param {ChatMessage[]} messages - Messages
   * @returns {Action[]} Actions
   */
  trackingDialogueState(actions: Action[], messages: ChatMessage[]): Action[];

  /**
   * Execute
   * @param {Action[]} actions - Actions
   * @param {ChatMessage[]} messages - Messages
   * @returns {Promise<any>} ChatCompletion
   */
  execute(actions: Action[], messages: ChatMessage[]): Promise<any>;

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
