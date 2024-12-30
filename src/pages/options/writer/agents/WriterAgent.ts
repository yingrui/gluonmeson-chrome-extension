import ThoughtAgent, {
  ThoughtAgentProps,
} from "@src/shared/agents/ThoughtAgent";
import WriterContext from "@src/pages/options/writer/context/WriterContext";
import { parseCommand } from "@src/shared/agents/AgentUtils";
import ThinkResult from "@src/shared/agents/core/ThinkResult";
import intl from "react-intl-universal";
import Environment from "@src/shared/agents/core/Environment";
import ChatMessage from "@src/shared/agents/core/ChatMessage";

class WriterAgent extends ThoughtAgent {
  commands = [
    {
      value: "outline",
      label: intl.get("options_app_writer_command_outline").d("/outline"),
    },
    {
      value: "review",
      label: intl.get("options_app_writer_command_review").d("/review"),
    },
    {
      value: "search",
      label: intl.get("options_app_writer_command_search").d("/search"),
    },
  ];
  context: WriterContext;

  constructor(props: ThoughtAgentProps, context: WriterContext) {
    super(props);
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
    const [command, userInput] = parseCommand(
      message.getContentText(),
      this.commands,
    );

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
        return this.executeCommand(
          [{ name: command, arguments: args }],
          new ChatMessage({ role: "user", content: userInput }),
        );
      }
    }
    return this.execute([]);
  }

  public getCommandOptions(): CommandOption[] {
    return this.commands;
  }

  async environment(): Promise<Environment> {
    return new Promise<Environment>((resolve, reject) => {
      const title = this.context.getTitle();
      const content = this.context.getContent();

      if (title) {
        resolve({
          systemPrompt: `As an article writer assistant by GluonMeson, named Guru Mason. Here’s how you can help users:

* Title: you can answer questions about reviewing/modifying/generating the title of current article.

Please answer questions in ${this.language}.
Current user is working on article
Title: ${title}
Content:
${content}.`,
        });
      } else {
        resolve({ systemPrompt: this.getInitialSystemMessage() });
      }
    });
  }

  public getInitialMessages(): ChatMessage[] {
    const messages = [
      new ChatMessage({
        role: "system",
        content: this.getInitialSystemMessage(),
      }),
      new ChatMessage({
        role: "assistant",
        content: intl
          .get("options_app_writer_assistant_greeting")
          .d("Ask me anything about writing!"),
        name: "Guru",
      }),
    ];
    return [...messages];
  }

  private getInitialSystemMessage(): string {
    return `As an assistant named Guru Mason. You can help users writing with given information.`;
  }
}

export default WriterAgent;
