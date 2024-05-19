import OpenAI from "openai";
import Tool from "./tool";

class TranslateAgent {
  modelName: string;
  client: OpenAI;
  tools: Tool[] = [];

  constructor(defaultModelName: string, client: OpenAI) {
    this.modelName = defaultModelName;
    this.client = client;
    this.initTools();
  }

  private initTools() {
    const translate = new Tool(
      "translate",
      "tranlate given content to target language for user",
    );
    translate.addStringParameter("userInput");
    translate.addStringParameter("targetLanguage");
    this.tools.push(translate);
  }

  getTools(): OpenAI.Chat.Completions.ChatCompletionTool[] {
    return this.tools.map((tool) => tool.getFunction());
  }

  async execute(
    tool: OpenAI.Chat.Completions.ChatCompletionMessageToolCall,
  ): Promise<any> {
    if (tool.function.name === "translate") {
      const args = JSON.parse(tool.function.arguments);
      return this.translate(args["userInput"], args["targetLanguage"]);
    }
    throw new Error(
      "Unexpected tool call in TranslateAgent: " + tool.function.name,
    );
  }

  async translate(userInput: string, targetLanguage: string = "") {
    const prompt = `You're a translator and good at Chinese & English. Please translate to opposite language according to user input.
Directly output the translation result, here is user input: ${userInput}`;

    return await this.client.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: this.modelName,
      stream: true,
    });
  }
}

export default TranslateAgent;
