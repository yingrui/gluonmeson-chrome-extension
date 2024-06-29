import OpenAI from "openai";
import Tool from "./Tool";
import ThoughtAgent from "./ThoughtAgent";

/**
 * Agent with tools
 */
class AgentWithTools extends ThoughtAgent {
  language: string;

  constructor(
    defaultModelName: string,
    toolsCallModel: string,
    client: OpenAI,
    language: string,
  ) {
    super(defaultModelName, toolsCallModel, client);
    this.language = language;
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
  public addTool(
    name: string,
    description: string,
    stringParameters: string[],
  ): Tool {
    const tool = new Tool(name, description);
    for (const stringParameter of stringParameters) {
      tool.addStringParameter(stringParameter);
    }

    this.getTools().push(tool);
    return tool;
  }

  /**
   * Execute
   * @param {string} action - Action
   * @param {object} args - Arguments
   * @param {ChatMessage[]} messages - Messages
   * @returns {Promise<any>} ChatCompletion
   */
  async execute(
    action: string,
    args: object,
    messages: ChatMessage[],
  ): Promise<any> {
    for (const member of Object.getOwnPropertyNames(
      Object.getPrototypeOf(this),
    )) {
      if (member === action && typeof this[member] === "function") {
        // TODO: need to verify if arguments of function are correct
        return this[member].apply(this, [args, messages]);
      }
    }

    return this.executeAction(action, args, messages);
  }

  /**
   * Execute command
   * @param {string} action - Action
   * @param {object} args - Pojo object as Arguments
   * @param {ChatMessage[]} messages - Messages
   * @returns {Promise<any>} ChatCompletion
   * @abstract
   */
  async executeAction(
    action: string,
    args: object,
    messages: ChatMessage[],
  ): Promise<any> {
    throw new Error("Unimplemented action: " + action);
  }
}

export default AgentWithTools;
