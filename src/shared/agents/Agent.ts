import Tool from "./Tool";
import Conversation from "./Conversation";
import ThinkResult from "./ThinkResult";

interface Agent {
  /**
   * Get name of agent
   * @returns {string} name
   */
  getName(): string;

  /**
   * Get name of agent
   * @returns {string} name
   */
  getDescription(): string;

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
   * Receive message
   * @param result
   */
  onCompleted(result: ThinkResult): Promise<string>;

  onReceiveStreamMessage(listener: (msg: string) => void): Agent;

  /**
   * Think
   * @returns {Promise<ThinkResult>} PlanResult
   */
  plan(): Promise<ThinkResult>;

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
   * @returns {Promise<ThinkResult>} ChatCompletion
   */
  execute(actions: Action[], conversation: Conversation): Promise<ThinkResult>;

  /**
   * Chat with user
   * @param {ChatMessage} message - Chat message
   * @returns {Promise<ThinkResult>} ChatCompletion
   * @async
   */
  chat(message: ChatMessage): Promise<ThinkResult>;

  /**
   * Describe the current environment
   * @returns {string} Environment description
   */
  environment(): Promise<string>;
}

export default Agent;
