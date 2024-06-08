import OpenAI from "openai";
import Tool from "./tool";
import AgentWithTools from "./AgentWithTools";

class TrelloAgent extends AgentWithTools {
  trelloSearchApi: string;
  apiKey: string;

  constructor(
    defaultModelName: string,
    client: OpenAI,
    trelloSearchApi: string,
    apiKey: string,
  ) {
    super(defaultModelName, client);
    this.addTool(
      "generate_story",
      "generate story content for user before they want to create a new card in Trello board",
      ["title", "keywords"],
    );
    this.addTool(
      "tasking",
      "Help developer to breakdown tasks for story in trello card, when user is browsing trello card page",
      ["userInput"],
    );
    // this.addTool("createCard", "create card in Trello board with given title and description", ["title", "desc", "column"]);

    this.trelloSearchApi = trelloSearchApi;
    this.apiKey = apiKey;
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
    return await this.chatCompletion([
      { role: "system", content: prompt },
      { role: "user", content: "explain:" },
    ]);
  }

  async handleCannotGetCardError(): Promise<any> {
    const prompt = `You're an Business Analyst or software engineer in Software Engineering Team.
But you cannot get any card information. Reply sorry and ask user to open or navigate to trello board card page, so you can get information of card.`;
    return await this.chatCompletion([
      { role: "system", content: prompt },
      { role: "user", content: "explain:" },
    ]);
  }

  async executeCommand(command: string, args: object): Promise<any> {
    if (command === "generate_story") {
      return this.generateStory(args["title"], args["keywords"]);
    }
    if (command === "tasking") {
      return this.tasking(args["userInput"]);
    }
    throw new Error("Unexpected tool call in TrelloAgent: " + command);
  }

  async generateStory(title, keywords = ""): Promise<any> {
    const board = await this.get_board();
    if (!board) return this.handleCannotGetBoardError();
    let prompt = "";
    if (board.type === "board") {
      const context = board.columns.map((column) => {
        const cards = column.cards.map((card, i) => i + ": " + card.name);
        return `
Column: ${column.name}
Cards: ${cards}
`;
      });
      prompt = `You're an Business Analyst in Software Engineering Team.
You're working on a board on: ${board.title}
Please write a story according to user instruction, and generate result directly.
Here is user input: ${title}
Generate title and story content, and story format should be Given/When/Then, and should include Test Cases as well.
Use markdown format to beautify output.
You need to consider other Columns & Cards information on board, they are:
${context}`;
    } else if (board.type === "card") {
      prompt = `You're an Business Analyst in Software Engineering Team.
You're working on a trello card on: ${board.title}, and the description is: ${board.description}
Please write or complete the story according to user instruction, and generate result directly.
Here is user input: ${title}
The story format should be Given/When/Then, and should include Test Cases as well.
Use markdown format to beautify output.`;
    }

    return await this.chatCompletion([
      { role: "system", content: prompt },
      { role: "user", content: "generate story:" },
    ]);
  }

  async tasking(userInput: string): Promise<any> {
    const board = await this.get_board();
    if (!board || board.type !== "card") return this.handleCannotGetCardError();
    const searchResult = await this.search(board.description);

    const prompt = `You're an software engineer in Team.
You're working on a story card on: ${board.title}
And the description is:
${board.description}
Please breakdown story to implementation tasks according to other tasking results, and generate result directly.
Here is user input: ${userInput}
Other tasking results are:
${JSON.stringify(searchResult)}
`;

    return await this.chatCompletion([
      { role: "system", content: prompt },
      {
        role: "user",
        content: "Use markdown format to beautify output, begin to breakdown:",
      },
    ]);
  }

  private async search(cardDescription: string): Promise<any> {
    if (this.trelloSearchApi.length <= 0) {
      return { total: 0, items: [] };
    }
    const response = await fetch(this.trelloSearchApi, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.apiKey,
      },
      body: JSON.stringify({ query: cardDescription }),
    });
    return response.json();
  }
}

export default TrelloAgent;
