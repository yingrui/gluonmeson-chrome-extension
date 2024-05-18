import OpenAI from "openai";

class TranslateAgent {
  modelName: string;
  client: OpenAI;

  constructor(defaultModelName: string, client: OpenAI) {
    this.modelName = defaultModelName;
    this.client = client;
  }

  async execute(userInput) {
    const prompt = `You're an assistant and good at translation.
                    Please translate to Chinese according to user instruction, and generate result directly. 
                    Here is user input: ${userInput}`;

    return await this.client.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: this.modelName,
      stream: true,
    });
  }
}

export default TranslateAgent;
