import OpenAI from "openai";
import ThoughtAgent from "@src/shared/agents/ThoughtAgent";

class TranslateAgent extends ThoughtAgent {
  constructor(
    defaultModelName: string,
    toolsCallModel: string,
    client: OpenAI,
    language: string,
  ) {
    super(defaultModelName, toolsCallModel, client, language);
    this.addTool(
      "translate",
      "translate given content to target language for user, default languages are Chinese & English",
      ["userInput", "targetLanguage"],
    );
  }

  async translate(args: object, messages: ChatMessage[]) {
    const userInput = args["userInput"];
    const targetLanguage =
      args["targetLanguage"] || "opposite language according to user input";
    const prompt = `You're a translator and good at Chinese & English. Please translate to ${targetLanguage}.
Directly output the result, below is user input:
${userInput}`;

    return await this.chatCompletion(messages, prompt, userInput);
  }
}

export default TranslateAgent;
