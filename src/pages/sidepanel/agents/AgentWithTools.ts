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
  ): void {
    const tool = new Tool(name, description);
    for (const stringParameter of stringParameters) {
      tool.addStringParameter(stringParameter);
    }
    this.tools.push(tool);
  }

  getTools(): OpenAI.Chat.Completions.ChatCompletionTool[] {
    return this.tools.map((tool) => tool.getFunction());
  }

  abstract async execute(
    tool: OpenAI.Chat.Completions.ChatCompletionMessageToolCall,
  ): Promise<any>;

  async chatCompletion(
    messages: OpenAI.ChatCompletionMessageParam[],
    stream: bool = true,
  ): Promise<any> {
    return await this.client.chat.completions.create({
      messages: messages,
      model: this.modelName,
      stream: stream,
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
    });
  }
}

export default AgentWithTools;
