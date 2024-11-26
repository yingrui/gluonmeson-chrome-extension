import OpenAI from "openai";
import Tool from "./Tool";
import Agent from "./Agent";
import Conversation from "./Conversation";
import Interaction from "./Interaction";
import ThinkResult from "./ThinkResult";
import { stringToAsyncIterator } from "../utils/streaming";

class ThoughtAgent implements Agent {
  modelName: string;
  toolsCallModel: string;
  client: OpenAI;
  language: string;
  tools: Tool[] = [];
  conversation: Conversation;
  name: string;
  description: string;

  constructor(
    modelName: string,
    toolsCallModel: string,
    client: OpenAI,
    language: string,
    name: string = "Guru",
    description: string = "Guru",
    conversation: Conversation = new Conversation(),
  ) {
    this.modelName = modelName;
    this.toolsCallModel = toolsCallModel;
    this.client = client;
    this.language = language;
    this.name = name;
    this.description = description;
    this.conversation = conversation;
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
   * @returns {Promise<any>} ChatCompletion
   * @async
   */
  async chat(message: ChatMessage): Promise<ThinkResult | any> {
    this.conversation.appendMessage(message);
    const plan = await this.plan();
    if (plan.type === "actions") {
      return this.execute(plan.actions, this.conversation);
    } else if (plan.type === "message") {
      return this.execute([this.replyAction(plan.message)], this.conversation);
    } else if (plan.type === "stream") {
      return plan;
    }
    throw new Error("Unknown plan type");
  }

  /**
   * Describe the current environment
   * @returns {string} Environment description
   */
  async environment(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      resolve("");
    });
  }

  /**
   * Think
   * @returns {Promise<ThinkResult>} ThinkResult
   */
  async plan(): Promise<ThinkResult> {
    const messages = this.conversation.getMessages();
    const interaction = this.conversation.getCurrentInteraction();
    const env = await this.environment();
    const systemMessage = { role: "system", content: env } as ChatMessage;
    const messagesWithEnv = env
      ? [systemMessage, ...messages.slice(1)]
      : messages;

    interaction.setStatus("Planning", `${this.getName()} is thinking...`);
    const toolCalls = this.getToolCalls();
    if (toolCalls.length === 0) {
      return { type: "actions", actions: [] };
    }
    const stream = await this.toolsCall(messagesWithEnv, toolCalls, true);
    const [first, second] = stream.tee();
    let actions = [];
    for await (const chunk of first) {
      if (chunk.choices) {
        if (chunk.choices.length == 0) {
          throw new Error("Empty choices in chunk");
        }
        const choice = chunk.choices[0];
        if (choice.finish_reason === "tool_calls") {
          const tools = choice.delta.tool_calls;
          if (tools) {
            actions = tools.map((t) => this.toAction(t));
          }
        } else {
          return { type: "stream", stream: second, firstChunk: chunk };
        }
      }
    }

    return { type: "actions", actions };
  }

  /**
   * Reflection
   * @returns {Promise<Action[]>} Actions
   */
  async reflection(): Promise<Action[]> {
    const systemMessage = {
      role: "system",
      content: this.getReflectionPrompt(),
    } as ChatMessage;
    const userMessage = {
      role: "user",
      content: "Based on reflection gives action, answer or suggestions",
    } as ChatMessage;
    const messagesWithEnv = [systemMessage, userMessage];

    const toolCalls = this.getToolCalls();
    const result = await this.toolsCall(messagesWithEnv, toolCalls);
    const choices = result.choices;
    if (choices.length > 0) {
      const choice = choices[0];
      if (choice.finish_reason === "tool_calls") {
        const tools = choice.message.tool_calls;
        if (tools) {
          return tools.map((t) => this.toAction(t));
        }
      } else if (choice.finish_reason === "stop" && choice.message.content) {
        return [this.replyAction(choice.message.content)];
      }
    }
    return [];
  }

  private getReflectionPrompt(): string {
    const messages = this.conversation.getMessages();
    const conversationContent = messages
      .map((m) => `- ${m.role}: ${m.content}`)
      .join("\n");
    return `## Role: Assistant
## Task
Analysis the conversation messages, and reflect on the assistant answers, think about:
- What is user intention?
- Whether the answer is correct and satisfied?
- What should user do next?
- When opened a webpage, usually could generate summary of this page
- When asked a question, could generate more questions for current topic
- When search a topic, could open the most related webpage for user to read

## Examples
### Example 1
#### Conversation Messages
user: ask_page
assistant: summary current page
#### Output
suggest some related interesting topics to user

## Conversation Messages
${conversationContent}

## Output
Choose the best action to execute, or generate new answer, or suggest more question to deep dive current topic.
`;
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
   * @param {Conversation} conversation - Conversation
   * @returns {Promise<any>} ChatCompletion
   */
  async execute(actions: Action[], conversation: Conversation): Promise<any> {
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
        conversation.getMessages(),
        env,
        args["userInput"],
      );
    }

    if (action === "reply") {
      return stringToAsyncIterator(args["content"]);
    }

    for (const member of this.getMemberOfSelf()) {
      if (member === action && typeof this[member] === "function") {
        // TODO: need to verify if arguments of function are correct
        return this[member].apply(this, [args, conversation.getMessages()]);
      }
    }

    // If could not find the action by function name,
    // then agent should implement executeAction method.
    return this.executeAction(action, args, conversation);
  }

  private getMemberOfSelf(): string[] {
    return Object.getOwnPropertyNames(Object.getPrototypeOf(this));
  }

  /**
   * Execute command
   * @param {string} action - Action
   * @param {object} args - Pojo object as Arguments
   * @param {Conversation} conversation - Conversation
   * @returns {Promise<any>} ChatCompletion
   */
  async executeAction(
    action: string,
    args: object,
    conversation: Conversation,
  ): Promise<any> {
    throw new Error("Unimplemented action: " + action);
  }

  private toAction(tool: ToolCall): Action {
    let args = {};
    try {
      if (tool.function.arguments) {
        args = JSON.parse(tool.function.arguments);
      }
    } catch (e) {
      console.error("Error parsing tool arguments", e);
      console.error("tool.function.arguments", tool.function.arguments);
    }
    return { name: tool.function.name, arguments: args } as Action;
  }

  private replyAction(content: string): Action {
    return { name: "reply", arguments: { content } } as Action;
  }

  private chatAction(userInput: string): Action {
    return { name: "chat", arguments: { userInput } } as Action;
  }

  /**
   * Chat completion
   * @param {ChatMessage[]} messages - Messages
   * @param {string} systemPrompt - System prompt
   * @param {string} replaceUserInput - Replace user input
   * @param {bool} stream - Stream
   * @returns {Promise<ThinkResult>} ThinkResult
   */
  async chatCompletion(
    messages: ChatMessage[],
    systemPrompt: string = "",
    replaceUserInput: string = "",
    stream: boolean = true,
  ): Promise<ThinkResult> {
    if (systemPrompt && messages.length > 0 && messages[0].role === "system") {
      const systemMessage = {
        role: "system",
        content: systemPrompt,
      } as ChatMessage;
      messages = [systemMessage, ...messages.slice(1)];
    }

    if (
      replaceUserInput &&
      messages.length > 1 &&
      messages[messages.length - 1].role === "user"
    ) {
      const userMessage = {
        role: "user",
        content: replaceUserInput,
      } as ChatMessage;
      messages = [...messages.slice(0, messages.length - 1), userMessage];
    }

    const streamResult = await this.client.chat.completions.create({
      messages: messages as OpenAI.ChatCompletionMessageParam[],
      model: this.modelName,
      stream: stream,
      max_tokens: 4096,
    });
    return { type: "stream", stream: streamResult };
  }

  /**
   * Tools call
   * @param {ChatMessage[]} messages - Messages
   * @param {OpenAI.Chat.Completions.ChatCompletionTool[]} tools - Tools
   * @param {bool} stream - Stream
   * @returns {Promise<Choice[]>}
   */
  private async toolsCall(
    messages: ChatMessage[],
    tools: OpenAI.Chat.Completions.ChatCompletionTool[],
    stream: boolean = false,
  ): Promise<any> {
    return await this.client.chat.completions.create({
      model: this.toolsCallModel,
      messages: messages as OpenAI.ChatCompletionMessageParam[],
      stream: stream,
      tools: tools,
      max_tokens: 4096,
      logprobs: false, // Log probability information for the choice.
    });
  }
}

export default ThoughtAgent;
