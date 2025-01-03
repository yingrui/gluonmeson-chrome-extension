import OpenAI from "openai";
import Tool from "./core/Tool";
import Conversation from "./core/Conversation";
import Thought from "./core/Thought";
import BaseAgent from "./BaseAgent";
import Environment from "./core/Environment";
import type { MessageContent } from "./core/ChatMessage";
import ChatMessage from "./core/ChatMessage";
import ModelService from "./services/ModelService";
import ReflectionService from "./services/ReflectionService";

interface ThoughtAgentProps {
  language: string;
  conversation: Conversation;
  enableMultimodal: boolean;
  enableReflection: boolean;
  modelService: ModelService;
  reflectionService?: ReflectionService;
}

class ThoughtAgent extends BaseAgent {
  language: string;
  protected readonly enableMultimodal: boolean;
  protected readonly enableReflection: boolean;
  private readonly tools: Tool[] = [];
  private readonly name: string;
  private readonly description: string;
  private readonly conversation: Conversation;
  private readonly modelService: ModelService;
  private readonly reflectionService: ReflectionService;

  constructor(
    props: ThoughtAgentProps,
    name: string = "Guru",
    description: string = "Guru",
  ) {
    super();
    this.language = props.language;
    this.conversation = props.conversation;
    this.modelService = props.modelService;
    this.reflectionService = props.reflectionService;
    this.enableMultimodal = props.enableMultimodal;
    this.enableReflection = props.enableReflection;
    this.name = name;
    this.description = description;
  }

  getName(): string {
    return this.name;
  }

  getDescription(): string {
    return this.description;
  }

  /**
   * Implement interface method, return tools that the agent can use
   * @returns {Tool[]} Tools
   */
  getTools(): Tool[] {
    return this.tools;
  }

  /**
   * Get conversation
   * @returns {Conversation} Conversation
   */
  getConversation(): Conversation {
    return this.conversation;
  }

  /**
   * Add tool
   * 1. Create a new tool with given name and description
   * 2. Add string parameters to the tool
   * 3. Set user input as argument, so agent can understand that user input could be which parameter
   *    - If there are more than one string parameters, and user input as argument is not given, set the first one as user input as argument
   *    - If user input as argument is given, set it as user input as argument
   *    eg. when user types "/ask_page xxx", agent should understand the user input (xxx) is the parameter "question"
   * 4. At last add tool to the tools
   * @param {string} name - Name of the tool
   * @param {string} description - Description of the tool
   * @param {string[]} stringParameters - String parameters
   * @returns {void}
   */
  addTool(name: string, description: string, stringParameters: string[]): Tool {
    const tool = new Tool(name, description);
    for (const stringParameter of stringParameters) {
      tool.addStringParameter(stringParameter);
    }

    this.getTools().push(tool);
    return tool;
  }

  /**
   * Get tool calls
   * @returns {OpenAI.Chat.Completions.ChatCompletionTool[]} ChatCompletionTools
   */
  getToolCalls(): OpenAI.Chat.Completions.ChatCompletionTool[] {
    return this.getTools().map((tool) => tool.getFunction());
  }

  /**
   * Choose the tool agent to execute the tool
   * @param {ChatMessage} message - Chat message
   * @returns {Promise<Thought>} ChatCompletion
   * @async
   */
  async chat(message: ChatMessage): Promise<Thought> {
    await this.onStartInteraction(message);
    const thought = await this.plan();
    if (thought.type === "actions") {
      return this.execute(thought.actions);
    } else if (["message", "stream"].includes(thought.type)) {
      return this.execute([this.replyAction(thought)]);
    } else if (thought.type === "error") {
      return thought;
    }
    throw new Error("Unknown plan type");
  }

  /**
   * Describe the current environment
   * @returns {Environment} Environment description
   */
  async environment(): Promise<Environment> {
    return new Promise<Environment>((resolve, reject) => {
      resolve({ systemPrompt: "" });
    });
  }

  /**
   * Think
   * @returns {Promise<Thought>} ThinkResult
   */
  async plan(): Promise<Thought> {
    const messages = this.conversation.getMessages();
    const env = this.getCurrentEnvironment();
    const systemMessage = new ChatMessage({
      role: "system",
      content: env.systemPrompt,
    });
    const messagesWithEnv = env.systemPrompt
      ? [systemMessage, ...messages.slice(1)]
      : messages;

    const interaction = this.conversation.getCurrentInteraction();
    interaction.setStatus("Planning", `${this.getName()} is thinking...`);

    const toolCalls = this.getToolCalls();
    if (toolCalls.length === 0) {
      return new Thought({ type: "actions", actions: [] });
    }
    return await this.toolsCall(messagesWithEnv, toolCalls, true);
  }

  /**
   * Reflection
   * @returns {Promise<Thought | null>} Actions
   */
  async reflection(): Promise<Thought | null> {
    if (!this.enableReflection) {
      return null;
    }

    const interaction = this.conversation.getCurrentInteraction();
    interaction.setStatus("Reflecting", `${this.getName()} is reflecting...`);

    return await this.reflectionService.reflection(
      this.getCurrentEnvironment(),
      this.conversation,
      this.getTools(),
    );
  }

  /**
   * Tracking dialogue state, should be invoked in execute method, before actions are executed
   * @param {Action[]} actions - Actions
   * @returns {Action[]} Actions
   */
  trackingDialogueState(actions: Action[]): Action[] {
    const messages = this.conversation.getMessages();
    const interaction = this.conversation.getCurrentInteraction();
    // TODO: Implement tracking dialogue state
    if (actions.length === 0) {
      return [this.chatAction(messages[messages.length - 1].content)];
    }
    // TODO: The connections between intent and actions are missing.
    interaction.setState(
      actions[0].name,
      actions[0].name,
      actions[0].arguments,
    );
    return actions;
  }

  /**
   * Execute
   * @param {Action[]} actions - Actions
   * @returns {Promise<Thought>} ChatCompletion
   */
  async execute(actions: Action[]): Promise<Thought> {
    const refinedActions = this.trackingDialogueState(actions);

    const interaction = this.conversation.getCurrentInteraction();
    const actionNameList = refinedActions.map((a) => a.name);
    interaction.setStatus(
      "Executing",
      `${this.getName()} is executing ${actionNameList.join(", ")}...`,
    );
    interaction.setAgentName(this.getName());

    // TODO: support multiple actions in future
    const action = refinedActions[0].name;
    const args = refinedActions[0].arguments;

    if (action === "chat") {
      const env = await this.environment();
      return this.chatCompletion(
        this.conversation.getMessages(),
        env.systemPrompt,
        args["userInput"],
      );
    }

    if (action === "reply") {
      return args["thought"] as Thought;
    }

    for (const member of this.getMemberOfSelf()) {
      if (member === action && typeof this[member] === "function") {
        // TODO: need to verify if arguments of function are correct
        return this[member].apply(this, [
          args,
          this.conversation.getMessages(),
        ]);
      }
    }

    // If could not find the action by function name,
    // then agent should implement executeAction method.
    return this.executeAction(action, args, this.conversation);
  }

  private getMemberOfSelf(): string[] {
    return Object.getOwnPropertyNames(Object.getPrototypeOf(this));
  }

  /**
   * Execute command
   * @param {string} action - Action
   * @param {object} args - Pojo object as Arguments
   * @param {Conversation} conversation - Conversation
   * @returns {Promise<Thought>} ChatCompletion
   */
  async executeAction(
    action: string,
    args: object,
    conversation: Conversation,
  ): Promise<Thought> {
    throw new Error("Unimplemented action: " + action);
  }

  private replyAction(thought: Thought): Action {
    return { name: "reply", arguments: { thought: thought } } as Action;
  }

  /**
   * Chat completion
   * @param {ChatMessage[]} messages - Messages
   * @param {string} systemPrompt - System prompt
   * @param {string} replaceUserInput - Replace user input
   * @param {bool} stream - Stream
   * @returns {Promise<Thought>} ThinkResult
   */
  async chatCompletion(
    messages: ChatMessage[],
    systemPrompt: string = "",
    replaceUserInput: string | MessageContent[] = "",
    stream: boolean = true,
    responseType: "text" | "json_object" = "text",
  ): Promise<Thought> {
    if (systemPrompt && messages.length > 0 && messages[0].role === "system") {
      const systemMessage = new ChatMessage({
        role: "system",
        content: systemPrompt,
      });
      messages = [systemMessage, ...messages.slice(1)];
    }

    if (
      replaceUserInput &&
      messages.length > 1 &&
      messages[messages.length - 1].role === "user"
    ) {
      const userMessage = new ChatMessage({
        role: "user",
        content: replaceUserInput,
      });
      messages = [...messages.slice(0, messages.length - 1), userMessage];
    }

    return await this.modelService.chatCompletion(
      messages,
      stream,
      this.enableMultimodal,
      responseType,
    );
  }

  private chatAction(userInput: string | MessageContent[]): Action {
    return { name: "chat", arguments: { userInput: userInput } } as Action;
  }

  /**
   * Tools call
   * @param {ChatMessage[]} messages - Messages
   * @param {OpenAI.Chat.Completions.ChatCompletionTool[]} tools - Tools
   * @param {bool} stream - Stream
   * @returns {Promise<any>}
   */
  async toolsCall(
    messages: ChatMessage[],
    tools: OpenAI.Chat.Completions.ChatCompletionTool[],
    stream: boolean = false,
    responseType: "text" | "json_object" = "text",
  ): Promise<Thought> {
    return await this.modelService.toolsCall(
      messages,
      tools,
      stream,
      responseType,
    );
  }
}

export default ThoughtAgent;
export type { ThoughtAgentProps };
