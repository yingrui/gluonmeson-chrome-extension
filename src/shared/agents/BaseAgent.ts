import Tool from "./core/Tool";
import Agent from "./core/Agent";
import Conversation from "./core/Conversation";
import Thought from "./core/Thought";
import ConversationRepository from "./ConversationRepository";
import Environment from "./core/Environment";
import ChatMessage from "./core/ChatMessage";
import SensitiveTopicError from "@src/shared/agents/errors/SensitiveTopicError";

abstract class BaseAgent implements Agent {
  private receiveStreamMessageListener: (msg: string) => void;
  private repo: ConversationRepository;

  protected constructor() {}

  /**
   * On start interaction:
   *  1. append user message
   *  2. perception environment
   *
   * There are two ways to call this method:
   *  1. When calling the chat method
   *  2. When calling the executeCommand method
   * @returns {void}
   */
  protected async onStartInteraction(message: ChatMessage): Promise<void> {
    this.getConversation().appendMessage(message);
    const env = await this.environment(); // Perception
    this.getConversation().getCurrentInteraction().environment = env;
  }

  /**
   * Get current environment
   */
  getCurrentEnvironment(): Environment {
    return this.getConversation().getCurrentInteraction().environment;
  }

  /**
   * Receive message
   * @param result
   */
  async onCompleted(result: Thought): Promise<string> {
    if (result.type === "error") {
      return result.error.message;
    }

    let message = "";
    if (result.type === "stream") {
      message = await this.readMessageFromStream(result.stream);
    } else if (result.type === "message") {
      message = result.message;
    }

    this.getConversation().appendMessage(
      new ChatMessage({
        role: "assistant",
        content: message,
        name: this.getName(),
      }),
    );
    await this.record();
    return message;
  }

  private async readMessageFromStream(stream: any): Promise<string> {
    let message = "";
    for await (const chunk of stream) {
      if (chunk.choices) {
        const finishReason = chunk.choices[0]?.finish_reason;
        if (finishReason === "sensitive") {
          throw new SensitiveTopicError();
        }
        const content = chunk.choices[0]?.delta?.content ?? "";
        message = message + content;
      } else {
        // When stream is not from openai chat completion, but an AsyncIterator
        message = message + chunk.data;
      }

      this.notifyMessageChanged(message);
    }
    return message;
  }

  protected notifyMessageChanged(message: string) {
    if (this.receiveStreamMessageListener) {
      this.receiveStreamMessageListener(message);
    }
  }

  onMessageChange(listener: (msg: string) => void): Agent {
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
   * @returns {Promise<Thought>} PlanResult
   */
  abstract plan(): Promise<Thought>;

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
   * @returns {Promise<Thought>} ChatCompletion
   */
  abstract execute(actions: Action[]): Promise<Thought>;

  /**
   * Execute
   * @param {Action[]} actions - Actions
   * @param {Conversation} conversation - Conversation
   * @returns {Promise<Thought>} ChatCompletion
   */
  async executeCommand(
    actions: Action[],
    message: ChatMessage,
  ): Promise<Thought> {
    await this.onStartInteraction(message);
    return await this.execute(actions);
  }

  /**
   * Chat with user
   * @param {ChatMessage} message - Chat message
   * @returns {Promise<Thought>} ChatCompletion
   * @async
   */
  abstract chat(message: ChatMessage): Promise<Thought>;

  /**
   * Describe the current environment
   * @returns {Environment} Environment description
   */
  abstract environment(): Promise<Environment>;
}

export default BaseAgent;
