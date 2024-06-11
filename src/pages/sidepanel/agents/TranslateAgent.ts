import OpenAI from "openai";
import Tool from "./tool";
import AgentWithTools from "./AgentWithTools";

class TranslateAgent extends AgentWithTools {
  constructor(defaultModelName: string, client: OpenAI, language: string) {
    super(defaultModelName, client, language);
    this.addTool(
      "translate",
      "translate given content to target language for user, default languages are Chinese & English",
      ["userInput", "targetLanguage"],
    );
  }

  async executeCommand(command: string, args: object): Promise<any> {
    if (command === "translate") {
      return this.translate(args["userInput"], args["targetLanguage"]);
    }
    throw new Error("Unexpected tool call in TranslateAgent: " + command);
  }

  async translate(
    userInput: string,
    targetLanguage: string = "opposite language according to user input",
  ) {
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
