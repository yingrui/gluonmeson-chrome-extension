import OpenAI from "openai";

class SummaryAgent {
  modelName: string;
  client: OpenAI;

  constructor(defaultModelName: string, client: OpenAI) {
    this.modelName = defaultModelName;
    this.client = client;
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

  async execute(userInput) {
    const content = await this.get_content();
    const prompt = `You're an assistant and good at summarization, the user is reading an article: ${content.title}. 
                    Please summarize the content according to user instruction: ${userInput}
                    The content text is: ${content.text}`;

    return await this.client.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: this.modelName,
      stream: true,
    });
  }
}

export default SummaryAgent;
