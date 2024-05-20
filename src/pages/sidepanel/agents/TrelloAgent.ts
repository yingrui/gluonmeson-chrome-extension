import OpenAI from "openai";
import Tool from "./tool";

class TrelloAgent {
  modelName: string;
  client: OpenAI;
  tools: Tool[] = [];

  constructor(defaultModelName: string, client: OpenAI) {
    this.modelName = defaultModelName;
    this.client = client;
    this.initTools();
  }

  private initTools() {
    const generateStory = new Tool(
      "generateStory",
      "generate story content for user before they want to create a new card in Trello board",
    );
    generateStory.addStringParameter("title");
    generateStory.addStringParameter("keywords");
    this.tools.push(generateStory);
    // const createCard = new Tool("createCard", "create card in Trello board with given title and description");
    // createCard.addStringParameter("title");
    // createCard.addStringParameter("desc");
    // createCard.addStringParameter("column");
    // this.tools.push(createCard);
  }

  getTools(): OpenAI.Chat.Completions.ChatCompletionTool[] {
    return this.tools.map((tool) => tool.getFunction());
  }

  private async get_board(): Promise<any> {
    return new Promise<any>(function (resolve, reject) {
      // send message to content script, call resolve() when received response"
      chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { type: "get_trello_board" },
          (response) => {
            resolve(response);
          },
        );
      });
    });
  }

  async handleCannotGetBoardError(): Promise<any> {
    const prompt = `You're an Business Analyst in Software Engineering Team.
But you cannot get any information. Reply sorry and ask user to open or navigate to trello board, so you can get information from board.`;
    return await this.client.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: this.modelName,
      stream: true,
    });
  }

  async execute(
    tool: OpenAI.Chat.Completions.ChatCompletionMessageToolCall,
  ): Promise<any> {
    if (tool.function.name === "generateStory") {
      const args = JSON.parse(tool.function.arguments);
      return this.generateStory(args["title"], args["keywords"]);
    }
    throw new Error(
      "Unexpected tool call in TrelloAgent: " + tool.function.name,
    );
  }

  async generateStory(title, keywords = ""): Promise<any> {
    const board = await this.get_board();
    if (!board) return this.handleCannotGetBoardError();

    const context = board.columns.map((column) => {
      const cards = column.cards.map((card, i) => i + ": " + card.name);
      return `
Column: ${column.name}
Cards: ${cards}
`;
    });
    const prompt = `You're an Business Analyst in Software Engineering Team.
You're working on a board on: ${board.title}
Please write a story according to user instruction, and generate result directly. 
Here is user input: ${title}
Generate title and story content, and story format should be Given/When/Then, and should include Test Cases as well.
Use markdown format to beautify output. 
You need to consider other Columns & Cards information on board, they are: 
${context}`;

    return await this.client.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: this.modelName,
      stream: true,
    });
  }
}

export default TrelloAgent;