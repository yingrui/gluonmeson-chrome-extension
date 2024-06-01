import OpenAI from "openai";
import Tool from "./tool";
import AgentWithTools from "./AgentWithTools";

class TranslateAgent extends AgentWithTools {
  constructor(defaultModelName: string, client: OpenAI) {
    super(defaultModelName, client);
    this.addTool(
      "translate",
      "translate given content to target language for user",
      ["userInput", "targetLanguage"],
    );
  }

  async executeCommand(command: string, args: any): Promise<any> {
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

    return await this.chatCompletion([{ role: "system", content: prompt }]);
  }
}

export default TranslateAgent;
