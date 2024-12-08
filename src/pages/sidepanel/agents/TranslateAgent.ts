import OpenAI from "openai";
import ThoughtAgent from "@src/shared/agents/ThoughtAgent";
import Conversation from "@src/shared/agents/Conversation";
import ThinkResult from "@src/shared/agents/ThinkResult";
import intl from "react-intl-universal";

class TranslateAgent extends ThoughtAgent {
  constructor(
    defaultModelName: string,
    toolsCallModel: string,
    client: OpenAI,
    language: string,
    conversation: Conversation = new Conversation(),
  ) {
    super(
      defaultModelName,
      toolsCallModel,
      client,
      language,
      "Translator",
      intl
        .get("agent_description_translator")
        .d("Translator, your translation assistant"),
      conversation,
    );
    this.addTool(
      "translate",
      "translate given content to target language for user, default languages are Chinese & English",
      ["userInput", "targetLanguage"],
    );
  }

  async translate(args: object, messages: ChatMessage[]): Promise<ThinkResult> {
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
