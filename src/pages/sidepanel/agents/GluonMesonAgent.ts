import OpenAI from "openai";
import Tool from "./tool";
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

class GluonMesonAgent {
  modelName = defaultModelName;
  mapToolsAgents = {};
  tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [];
  commands = {
    page({ userInput }) {
      return new SummaryAgent(defaultModelName, client).askPage(userInput);
    },
    summary({ userInput }) {
      return new SummaryAgent(defaultModelName, client).summarize(userInput);
    },
    translate({ userInput }) {
      return new TranslateAgent(defaultModelName, client).translate(userInput);
    },
    trello({ userInput }) {
      return new TrelloAgent(defaultModelName, client).generateStory(userInput);
    },
  };

  constructor() {
    this.addAgent(new SummaryAgent(defaultModelName, client));
    this.addAgent(new TranslateAgent(defaultModelName, client));
    this.addAgent(new TrelloAgent(defaultModelName, client));
    this.initTools();
  }

  private addAgent(agent: any) {
    for (const tool of agent.getTools()) {
      this.tools.push(tool);
      this.mapToolsAgents[tool.function.name] = agent;
    }
  }

  private initTools() {
    const help = new Tool(
      "help",
      "Answer what can GluonMeson Chrome Extension do. The user might ask like: what can you do, or just say help.",
    );
    help.addStringParameter("question");
    const tool = help.getFunction();
    this.tools.push(tool);
    this.mapToolsAgents[tool.function.name] = this;
  }

  public getCommandOptions(): any[] {
    return Object.keys(this.commands).map((key) => ({
      value: key,
      label: key,
    }));
  }

  async execute(
    tool: OpenAI.Chat.Completions.ChatCompletionMessageToolCall,
  ): Promise<any> {
    if (tool.function.name === "help") {
      const args = JSON.parse(tool.function.arguments);
      return this.help(args["question"]);
    }
    throw new Error(
      "Unexpected tool call in TranslateAgent: " + tool.function.name,
    );
  }

  async help(question: string): Promise<any> {
    const tools = this.tools
      .map(
        (t) =>
          `${t.function.name}: ${t.function.description}: ${t.function.parameters}`,
      )
      .join("\n");
    const prompt = `You're an assistant provided by GluonMeson, when user asked ${question}.
Please tell user what you can do for them. There are tools:
${tools}`;

    return await client.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: this.modelName,
      stream: true,
    });
  }

  async callTool(messages: ChatMessage[]): Promise<any> {
    const chatCompletion = await client.chat.completions.create({
      model: toolsCallModel,
      messages: messages as OpenAI.ChatCompletionMessageParam[],
      stream: false,
      tools: this.tools,
    });

    const tool_calls = chatCompletion.choices[0].message.tool_calls;
    if (tool_calls) {
      for (const tool of tool_calls) {
        const agent = this.mapToolsAgents[tool.function.name];
        return agent.execute(tool);
      }
    }

    return client.chat.completions.create({
      messages: messages as OpenAI.ChatCompletionMessageParam[],
      model: this.modelName,
      stream: true,
    });
  }

  async chat(messages: ChatMessage[]) {
    const [command, userInput] = this.parseCommand(
      this.getLastUserInput(messages),
    );

    const commandExecutor = this.commands[command];

    if (commandExecutor) {
      return commandExecutor({ userInput });
    } else {
      if (toolsCallModel) {
        return this.callTool(messages);
      } else {
        return client.chat.completions.create({
          messages: messages as OpenAI.ChatCompletionMessageParam[],
          model: this.modelName,
          stream: true,
        });
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
