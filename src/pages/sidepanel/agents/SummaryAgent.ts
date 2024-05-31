import OpenAI from "openai";
import Tool from "./tool";
import AgentWithTools from "./AgentWithTools";

class SummaryAgent extends AgentWithTools {
  constructor(defaultModelName: string, client: OpenAI) {
    super(defaultModelName, client);
    this.addTool(
      "summary",
      "understand user's instruct and generate summary from given content for user",
      ["instruct"],
    );
    this.addTool(
      "ask_page",
      "Answer user's question based on current web page content",
      ["question"],
    );
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
    } else if (tool.function.name === "ask_page") {
      const args = JSON.parse(tool.function.arguments);
      return this.askPage(args["question"]);
    }
    throw new Error(
      "Unexpected tool call in SummaryAgent: " + tool.function.name,
    );
  }

  async summarize(instruct: string) {
    const content = await this.get_content();
    const prompt = `You're an assistant and good at summarization, the user is reading an article: ${content.title}. 
Please summarize the content according to user instruction: ${instruct}
The content text is: ${content.text}`;

    return await this.chatCompletion([{ role: "system", content: prompt }]);
  }

  async askPage(question: string) {
    const content = await this.get_content();
    const prompt = `You're an assistant, the user is reading an article: ${content.title}.
Please answer user's question: ${question}
The content text is: ${content.text}`;

    return await this.chatCompletion([{ role: "system", content: prompt }]);
  }
}

export default SummaryAgent;
