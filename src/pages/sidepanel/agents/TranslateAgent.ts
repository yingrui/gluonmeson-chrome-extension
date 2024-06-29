import OpenAI from "openai";
import AgentWithTools from "./AgentWithTools";

class TranslateAgent extends AgentWithTools {
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

    return await this.chatCompletion([
      { role: "system", content: prompt },
      { role: "user", content: "output:" },
    ]);
  }
}

export default TranslateAgent;
