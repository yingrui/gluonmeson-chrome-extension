import Tool from "./Tool";
import Agent from "./Agent";
import Conversation from "./Conversation";
import ThinkResult from "./ThinkResult";
import ConversationRepository from "./ConversationRepository";
import Environment from "./Environment";
import ChatMessage from "./ChatMessage";

abstract class BaseAgent implements Agent {
  private result: ThinkResult;
  private receiveStreamMessageListener: (msg: string) => void;
  private repo: ConversationRepository;

  protected constructor() {}

  /**
   * Receive message
   * @param result
   */
  async onCompleted(result: ThinkResult): Promise<string> {
    this.result = result;
    let message = "";

    const stream = this.result.stream;
    for await (const chunk of stream) {
      if (chunk.choices) {
        const finishReason = chunk.choices[0]?.finish_reason;
        const content = chunk.choices[0]?.delta?.content ?? "";
        message = message + content;
      } else {
        message = message + chunk.data;
      }

      if (this.receiveStreamMessageListener) {
        this.receiveStreamMessageListener(message);
      }
    }
    this.result = null; // reset result

    const chatMessage = new ChatMessage({
      role: "assistant",
      content: message,
      name: this.getName(),
    });
    this.getConversation().appendMessage(chatMessage);
    await this.record();
    return message;
  }

  onReceiveStreamMessage(listener: (msg: string) => void): Agent {
    this.receiveStreamMessageListener = listener;
    return this;
  }

  async record(): Promise<string> {
    if (this.repo) {
      return await this.repo.save(this.getConversation());
    }

    return null;
  }

  setConversationRepository(conversationRepository: ConversationRepository) {
    this.repo = conversationRepository;
  }

  /**
   * Get name of agent
   * @returns {string} name
   */
  abstract getName(): string;

  /**
   * Get name of agent
   * @returns {string} name
   */
  abstract getDescription(): string;

  /**
   * Implement interface method, return tools that the agent can use
   * @returns {Tool[]} Tools
   */
  abstract getTools(): Tool[];

  /**
   * Get conversation
   * @returns {Conversation} Conversation
   */
  abstract getConversation(): Conversation;

  /**
   * Think
   * @returns {Promise<ThinkResult>} PlanResult
   */
  abstract plan(): Promise<ThinkResult>;

  /**
   * Reflection
   * @returns {Promise<Action[]>} Actions
   */
  abstract reflection(): Promise<Action[]>;

  /**
   * Tracking dialogue state, should be invoked in execute method, before actions are executed
   * @param {Action[]} actions - Actions
   * @returns {Action[]} Actions
   */
  abstract trackingDialogueState(actions: Action[]): Action[];

  /**
   * Execute
   * @param {Action[]} actions - Actions
   * @param {Conversation} conversation - Conversation
   * @returns {Promise<ThinkResult>} ChatCompletion
   */
  abstract execute(
    actions: Action[],
    conversation: Conversation,
  ): Promise<ThinkResult>;

  /**
   * Chat with user
   * @param {ChatMessage} message - Chat message
   * @returns {Promise<ThinkResult>} ChatCompletion
   * @async
   */
  abstract chat(message: ChatMessage): Promise<ThinkResult>;

  /**
   * Describe the current environment
   * @returns {Environment} Environment description
   */
  abstract environment(): Promise<Environment>;
}

export default BaseAgent;
