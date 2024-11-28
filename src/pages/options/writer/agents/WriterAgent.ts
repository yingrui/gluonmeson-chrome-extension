import OpenAI from "openai";
import ThoughtAgent from "@src/shared/agents/ThoughtAgent";
import WriterContext from "@src/pages/options/writer/context/WriterContext";
import { parseCommand } from "@src/shared/agents/AgentUtils";
import ThinkResult from "@src/shared/agents/ThinkResult";

class WriterAgent extends ThoughtAgent {
  commands = [
    { value: "outline", label: "/outline" },
    { value: "review", label: "/review" },
    { value: "search", label: "/search" },
  ];
  context: WriterContext;

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

  /**
   * Choose the tool agent to execute the tool
   * @param {ChatMessage} message - Chat message
   * @returns {Promise<any>} ChatCompletion
   * @async
   */
  async chat(message: ChatMessage): Promise<ThinkResult> {
    const [command, userInput] = parseCommand(message.content, this.commands);

    if (this.commands.find((c) => c.value === command)) {
      this.getConversation().appendMessage(message);
      return this.executeCommandWithUserInput(command, userInput);
    } else {
      return super.chat(message);
    }
  }

  async executeCommandWithUserInput(
    command: string,
    userInput: string,
  ): Promise<ThinkResult> {
    const args = {};
    // Find the tool with the given command
    for (const tool of this.getTools()) {
      if (tool.name === command) {
        args["userInput"] = userInput;
        return this.execute(
          [{ name: command, arguments: args }],
          this.getConversation(),
        );
      }
    }
    return this.execute([], this.conversation);
  }

  public getCommandOptions(): CommandOption[] {
    return this.commands;
  }

  async environment(): Promise<string> {
    return new Promise<any>((resolve, reject) => {
      const title = this.context.getTitle();
      const content = this.context.getContent();

      if (title) {
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
      {
        role: "assistant",
        content: "Ask me anything about writing!",
        name: "Guru",
      },
    ] as ChatMessage[];
    return messages;
  }

  private getInitialSystemMessage(): string {
    return `As an assistant named Guru Mason. You can help users writing with given information.`;
  }
}

export default WriterAgent;
