import OpenAI from "openai";

class TranslateAgent {
  modelName: string;
  client: OpenAI;

  constructor(defaultModelName: string, client: OpenAI) {
    this.modelName = defaultModelName;
    this.client = client;
  }

  async execute(userInput) {
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
