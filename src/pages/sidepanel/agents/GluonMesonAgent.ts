import OpenAI from "openai";
import Tool from "./tool";
import AgentWithTools from "./AgentWithTools";
import TrelloAgent from "./TrelloAgent";
import SummaryAgent from "./SummaryAgent";
import TranslateAgent from "./TranslateAgent";
import configureStorage from "@root/src/shared/storages/gluonConfig";

let defaultModelName = "gpt-3.5-turbo";
let toolsCallModel: string = null;
let client: OpenAI;
configureStorage.get().then((config) => {
  client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
    dangerouslyAllowBrowser: true,
  });
  defaultModelName = config.defaultModel
    ? config.defaultModel
    : defaultModelName;
  toolsCallModel = config.toolsCallModel
    ? config.toolsCallModel
    : toolsCallModel;
});

class GluonMesonAgent extends AgentWithTools {
  toolsCallModel: string = null;
  mapToolsAgents = {};
  chatCompletionTools: OpenAI.Chat.Completions.ChatCompletionTool[] = [];
  commands = ["ask_page", "summary", "translate", "trello", "help"];

  constructor() {
    super(defaultModelName, client);
    this.addTool(
      "help",
      "Answer what can GluonMeson Chrome Extension do. The user might ask like: what can you do, or just say help.",
      ["question"],
    );

    this.addAgent(new SummaryAgent(defaultModelName, this.client));
    this.addAgent(new TranslateAgent(defaultModelName, this.client));
    this.addAgent(new TrelloAgent(defaultModelName, this.client));
    this.addAgent(this);

    this.toolsCallModel = toolsCallModel;
  }

  private addAgent(agent: any) {
    for (const tool of agent.getTools()) {
      this.chatCompletionTools.push(tool);
      this.mapToolsAgents[tool.function.name] = agent;
    }
  }

  public getCommandOptions(): any[] {
    return this.commands.map((key) => {
      return {
        value: key,
        label: key,
      };
    });
  }

  async executeCommand(command: string, args: any): Promise<any> {
    if (command === "help") {
      return this.help(args["question"]);
    }
    throw new Error("Unexpected tool call in GluonMesonAgent: " + command);
  }

  async help(question: string): Promise<any> {
    const tools = this.chatCompletionTools
      .map(
        (t) =>
          `${t.function.name}: ${t.function.description}: ${t.function.parameters}`,
      )
      .join("\n");
    const prompt = `You're an assistant provided by GluonMeson, when user asked ${question}.
Please tell user what you can do for them. There are tools:
${tools}`;

    return await this.chatCompletion([{ role: "system", content: prompt }]);
  }

  async callTool(messages: ChatMessage[]): Promise<any> {
    const chatCompletion = await this.toolsCall(
      this.toolsCallModel,
      messages,
      this.chatCompletionTools,
    );

    const tool_calls = chatCompletion.choices[0].message.tool_calls;
    if (tool_calls) {
      for (const tool of tool_calls) {
        const agent = this.mapToolsAgents[tool.function.name];
        return agent.execute(tool);
      }
    }

    return this.chatCompletion(messages);
  }

  async chat(messages: ChatMessage[]) {
    const [command, userInput] = this.parseCommand(
      this.getLastUserInput(messages),
    );

    const commandExecutor = this.commands[command];

    if (this.commands.includes(command)) {
      const agent = this.mapToolsAgents[command];
      return agent.executeCommandWithUserInput(command, userInput);
    } else {
      if (toolsCallModel) {
        return this.callTool(messages);
      } else {
        return this.chatCompletion(messages);
      }
    }
  }

  private getLastUserInput(messages: ChatMessage[]) {
    return messages.slice(-1)[0].content;
  }

  private parseCommand(userInput: string): [string, string] {
    const commandKeys = Object.keys(this.commands);

    const matchedCommand = commandKeys.find((commandKey) =>
      userInput.match(new RegExp(`(?:^|\\s)/${commandKey}\\s+`)),
    );

    if (matchedCommand) {
      const input = userInput.match(
        new RegExp(`(?:^|\\s)/${matchedCommand}\\s+(.*)`),
      )[1];
      return [matchedCommand, input];
    }
    return ["chat", userInput];
  }
}

export default GluonMesonAgent;
