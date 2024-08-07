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
   * @returns {Promise<Action[]>} Actions
   */
  plan(): Promise<Action[]>;

  /**
   * Reflection
   * @returns {Promise<Action[]>} Actions
   */
  reflection(): Promise<Action[]>;

  /**
   * Tracking dialogue state, should be invoked in execute method, before actions are executed
   * @param {Action[]} actions - Actions
   * @returns {Action[]} Actions
   */
  trackingDialogueState(actions: Action[]): Action[];

  /**
   * Execute
   * @param {Action[]} actions - Actions
   * @param {Conversation} conversation - Conversation
   * @returns {Promise<any>} ChatCompletion
   */
  execute(actions: Action[], conversation: Conversation): Promise<any>;

  /**
   * Chat with user
   * @param {ChatMessage} message - Chat message
   * @returns {Promise<any>} ChatCompletion
   * @async
   */
  chat(message: ChatMessage): Promise<any>;

  /**
   * Describe the current environment
   * @returns {string} Environment description
   */
  environment(): Promise<string>;
}

export default Agent;
