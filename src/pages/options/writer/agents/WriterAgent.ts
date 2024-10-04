import OpenAI from "openai";
import ThoughtAgent from "@src/shared/agents/ThoughtAgent";
import Conversation from "@src/shared/agents/Conversation";

class WriterAgent extends ThoughtAgent {
  commands = [
    { value: "outline", label: "/outline" },
    { value: "review", label: "/review" },
    { value: "search", label: "/search" },
  ];
  context: WriterContext;

  static create(config: any, context: WriterContext): WriterAgent {
    const defaultModel = config.defaultModel ?? "gpt-3.5-turbo";
    const toolsCallModel = config.toolsCallModel ?? null;
    const apiKey = config.apiKey ?? "";
    const language = config.language ?? "English";
    const enableReflection = config.enableReflection ?? false;

    const client = new OpenAI({
      apiKey: apiKey,
      baseURL: config.baseURL,
      organization: config.organization,
      dangerouslyAllowBrowser: true,
    });

    return new WriterAgent(
      defaultModel,
      toolsCallModel,
      client,
      language,
      context,
    );
  }

  constructor(
    defaultModelName: string,
    toolsCallModel: string,
    client: OpenAI,
    language: string,
    context: WriterContext,
  ) {
    super(defaultModelName, toolsCallModel, client, language);
    this.getConversation().set(this.getInitialMessages());
    this.context = context;
  }

  public getCommandOptions(): object[] {
    return this.commands;
  }

  async environment(): Promise<string> {
    return new Promise<any>((resolve, reject) => {
      const title = this.context.getTitle();
      const content = this.context.getContent();
      console.log(title, content);
      if (content) {
        resolve(`As an article writer assistant by GluonMeson, named Guru Mason. Here’s how you can help users:

* Title: you can answer questions about reviewing/modifying/generating the title of current article.

Please answer questions in ${this.language}.
Current user is working on article
Title: ${title}
Content:
${content}.`);
      } else {
        resolve(this.getInitialSystemMessage());
      }
    });
  }

  public getInitialMessages(): ChatMessage[] {
    const messages = [
      {
        role: "system",
        content: this.getInitialSystemMessage(),
      },
      { role: "assistant", content: "Ask me anything about writing!" },
    ] as ChatMessage[];
    return messages;
  }

  private getInitialSystemMessage(): string {
    return `As an assistant named Guru Mason. You can help users writing with given information.`;
  }
}

export default WriterAgent;
