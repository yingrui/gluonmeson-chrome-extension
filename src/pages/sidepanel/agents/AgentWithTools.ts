import OpenAI from "openai";
import Tool from "./tool";

abstract class AgentWithTools {
  modelName: string;
  client: OpenAI;
  tools: Tool[] = [];

  constructor(defaultModelName: string, client: OpenAI) {
    this.modelName = defaultModelName;
    this.client = client;
  }

  public addTool(
    name: string,
    description: string,
    stringParameters: string[],
    userInputAsArgument: string = null,
  ): void {
    const tool = new Tool(name, description);
    for (const stringParameter of stringParameters) {
      tool.addStringParameter(stringParameter);
    }

    if (stringParameters.length > 0 && userInputAsArgument === null) {
      tool.setUserInputAsArgument(stringParameters[0]);
    } else if (userInputAsArgument) {
      tool.setUserInputAsArgument(userInputAsArgument);
    }
    this.tools.push(tool);
  }

  getTools(): OpenAI.Chat.Completions.ChatCompletionTool[] {
    return this.tools.map((tool) => tool.getFunction());
  }

  async execute(
    tool: OpenAI.Chat.Completions.ChatCompletionMessageToolCall,
  ): Promise<any> {
    let args = {};
    try {
      if (tool.function.arguments) {
        args = JSON.parse(tool.function.arguments);
      }
    } catch (e) {
      console.error("Error parsing tool arguments", e);
      console.error("tool.function.arguments", tool.function.arguments);
    }
    return this.executeCommand(tool.function.name, args);
  }

  async executeCommandWithUserInput(
    command: string,
    userInput: string,
  ): Promise<any> {
    const args = {};
    for (const tool of this.tools) {
      if (tool.name === command) {
        args[tool.userInputAsArgument] = userInput;
        break;
      }
    }
    return this.executeCommand(command, args);
  }

  abstract async executeCommand(command: string, args: any): Promise<any>;

  async chatCompletion(
    messages: OpenAI.ChatCompletionMessageParam[],
    stream: bool = true,
  ): Promise<any> {
    return await this.client.chat.completions.create({
      messages: messages,
      model: this.modelName,
      stream: stream,
      max_tokens: 4096,
    });
  }

  async toolsCall(
    toolsCallModel: string,
    messages: OpenAI.ChatCompletionMessageParam[],
    tools: OpenAI.Chat.Completions.ChatCompletionTool[],
  ): Promise<any> {
    return await this.client.chat.completions.create({
      model: toolsCallModel,
      messages: messages,
      stream: false,
      tools: tools,
      max_tokens: 4096,
    });
  }
}

export default AgentWithTools;
