import Tool from "./Tool";
import Conversation from "./Conversation";
import Thought from "./Thought";
import Environment from "./Environment";
import ChatMessage from "./ChatMessage";

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
  onCompleted(result: Thought): Promise<string>;

  /**
   * Add listener for receiving stream message
   * @param listener
   */
  onMessageChange(listener: (msg: string) => void): Agent;

  /**
   * Think
   * @returns {Promise<Thought>} PlanResult
   */
  plan(): Promise<Thought>;

  /**
   * Reflection
   * @returns {Promise<Thought>} Actions
   */
  reflection(): Promise<Thought>;

  /**
   * Tracking dialogue state, should be invoked in execute method, before actions are executed
   * @param {Action[]} actions - Actions
   * @returns {Action[]} Actions
   */
  trackingDialogueState(actions: Action[]): Action[];

  /**
   * Execute
   * @param {Action[]} actions - Actions
   * @returns {Promise<Thought>} ChatCompletion
   */
  execute(actions: Action[]): Promise<Thought>;

  /**
   * Execute command
   * @param {Action[]} actions - Actions
   * @param {Conversation} conversation - Conversation
   * @returns {Promise<Thought>} ChatCompletion
   */
  executeCommand(actions: Action[], message: ChatMessage): Promise<Thought>;

  /**
   * Chat with user
   * @param {ChatMessage} message - Chat message
   * @returns {Promise<Thought>} ChatCompletion
   * @async
   */
  chat(message: ChatMessage): Promise<Thought>;

  /**
   * Describe the current environment
   * @returns {Environment} Environment description
   */
  environment(): Promise<Environment>;
}

export default Agent;
