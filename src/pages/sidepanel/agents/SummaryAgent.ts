import OpenAI from "openai";
import Tool from "./tool";

class SummaryAgent {
  modelName: string;
  client: OpenAI;
  tools: Tool[] = [];

  constructor(defaultModelName: string, client: OpenAI) {
    this.modelName = defaultModelName;
    this.client = client;
    this.initTools();
  }

  private initTools() {
    const summary = new Tool(
      "summary",
      "understand user's instruct and generate summary from given content for user",
    );
    summary.addStringParameter("instruct");
    this.tools.push(summary);
  }

  getTools(): OpenAI.Chat.Completions.ChatCompletionTool[] {
    return this.tools.map((tool) => tool.getFunction());
  }

  private async get_content(): Promise<any> {
    return new Promise<any>(function (resolve, reject) {
      // send message to content script, call resolve() when received response"
      chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { type: "get_content" },
          (response) => {
            resolve(response);
          },
        );
      });
    });
  }

  async execute(
    tool: OpenAI.Chat.Completions.ChatCompletionMessageToolCall,
  ): Promise<any> {
    if (tool.function.name === "summary") {
      const args = JSON.parse(tool.function.arguments);
      return this.summarize(args["instruct"]);
    }
    throw new Error(
      "Unexpected tool call in TranslateAgent: " + tool.function.name,
    );
  }

  async summarize(instruct: string) {
    const content = await this.get_content();
    const prompt = `You're an assistant and good at summarization, the user is reading an article: ${content.title}. 
Please summarize the content according to user instruction: ${instruct}
The content text is: ${content.text}`;

    return await this.client.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: this.modelName,
      stream: true,
    });
  }
}

export default SummaryAgent;
