import OpenAI from "openai";
import Tool from "./tool";
import AgentWithTools from "./AgentWithTools";
import { fromReadableStream } from "../utils/streaming";

class BACopilotAgent extends AgentWithTools {
  baCopilotKnowledgeApi: string;
  baCopilotApi: string;
  apiKey: string;
  conversationIds = {};

  constructor(
    defaultModelName: string,
    client: OpenAI,
    language: string,
    baCopilotKnowledgeApi: string,
    baCopilotApi: string,
    apiKey: string,
  ) {
    super(defaultModelName, client, language);
    this.addTool(
      "generate_story",
      "generate story content for user before they want to create a new card in story board",
      ["title", "keywords"],
    );
    this.addTool(
      "tasking",
      "Help developer to breakdown tasks for story in story card, when user is browsing story card page",
      ["userInput"],
    );
    // this.addTool("createCard", "create card in story board with given title and description", ["title", "desc", "column"]);

    this.baCopilotKnowledgeApi = baCopilotKnowledgeApi;
    this.baCopilotApi = baCopilotApi;
    this.apiKey = apiKey;
  }

  private async get_board(): Promise<any> {
    return new Promise<any>(function (resolve, reject) {
      // send message to content script, call resolve() when received response"
      chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { type: "get_story_board" },
          (response) => {
            resolve(response);
          },
        );
      });
    });
  }

  async handleCannotGetBoardError(): Promise<any> {
    const prompt = `You're an Business Analyst in Software Engineering Team.
But you cannot get any information. Reply sorry and ask user to open or navigate to story board, so you can get information from board.`;
    return await this.chatCompletion([
      { role: "system", content: prompt },
      { role: "user", content: `explain in ${this.language}:` },
    ]);
  }

  async handleCannotGetCardError(): Promise<any> {
    const prompt = `You're an Business Analyst or software engineer in Software Engineering Team.
But you cannot get any card information. Reply sorry and ask user to open or navigate to story board card page, so you can get information of card.`;
    return await this.chatCompletion([
      { role: "system", content: prompt },
      { role: "user", content: `explain in ${this.language}:` },
    ]);
  }

  /**
   * Execute command: generate_story and tasking
   * @param {string} command - Command
   * @param {object} args - Arguments
   * @param {ChatMessage[]} messages - Messages
   * @returns {Promise<any>} ChatCompletion
   * @throws {Error} Unexpected tool call
   */
  async executeCommand(
    command: string,
    args: object,
    messages: ChatMessage[],
  ): Promise<any> {
    if (command === "generate_story") {
      return this.generateStory(args["title"], args["keywords"]);
    }
    if (command === "tasking") {
      return this.tasking(args["userInput"]);
    }
    throw new Error("Unexpected tool call in BACopilotAgent: " + command);
  }

  async generateStoryWithGPTModel(board, title, keywords = ""): Promise<any> {
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
Please write a story according to user instruction, and generate story in ${this.language} directly.
Here is user input: ${title}
Generate title and story content, and story format should be Given/When/Then, and should include Test Cases as well.
Use markdown format to beautify output.
You need to consider other Columns & Cards information on board, they are:
${context}`;
    } else if (board.type === "card") {
      prompt = `You're an Business Analyst in Software Engineering Team.
You're working on a story card on: ${board.title}, and the description is: ${board.description}
Please write or complete the story according to user instruction, and generate story in ${this.language} directly.
Here is user input: ${title}
The story format should be Given/When/Then, and should include Test Cases as well.
Use markdown format to beautify output.`;
    }

    return await this.chatCompletion([
      { role: "system", content: prompt },
      { role: "user", content: `generate story in ${this.language}:` },
    ]);
  }

  async generateStory(title, keywords = ""): Promise<any> {
    const board = await this.get_board();
    if (!board) return this.handleCannotGetBoardError();
    if (this.baCopilotApi) {
      return this.generateStoryWithGluonMesonAgent(board, title, keywords);
    } else {
      return this.generateStoryWithGPTModel(board, title, keywords);
    }
  }

  async generateStoryWithGluonMesonAgent(
    board,
    title,
    keywords = "",
  ): Promise<any> {
    try {
      const conversation = await this.createConversation(
        board,
        title,
        keywords,
      );
      const conversationId = conversation.id;
      const response = await fetch(
        this.baCopilotApi + "/conversations/" + conversationId + "/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + this.apiKey,
          },
          body: JSON.stringify({ message: title }),
        },
      );
      return fromReadableStream(response.body);
    } catch (error) {
      console.error(error);
      return this.generateStoryWithGPTModel(board, title, keywords);
    }

    return this.generateStoryWithGPTModel(board, title, keywords);
  }

  private async createConversation(board, title, keywords = ""): Promise<any> {
    if (this.conversationIds[board.url]) {
      console.log("found conversation id", this.conversationIds[board.url]);
      const data = this.conversationIds[board.url];
      return new Promise<any>(function (resolve, reject) {
        resolve(data);
      });
    }

    const payload = {
      variables: [
        { name: "title", value: board.type === "board" ? title : board.title },
        { name: "description", value: board.description ?? "" },
      ],
    };

    const response = await fetch(this.baCopilotApi + "/conversations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (response.status == 200) {
      const jsonResult = await response.json();
      if (jsonResult["status"] === "Success") {
        this.conversationIds[board.url] = jsonResult.data;
        return jsonResult.data;
      } else {
        throw new Error("Failed to create conversation: " + jsonResult.status);
      }
    } else {
      throw new Error("Failed to create conversation: " + response.statusText);
    }
  }

  async tasking(userInput: string): Promise<any> {
    const board = await this.get_board();
    if (!board || board.type !== "card") return this.handleCannotGetCardError();
    const searchResult = await this.search(board.description);

    const prompt = `You're an software engineer in Team.
You're working on a story card on: ${board.title}
And the story description is:
${board.description}
Please breakdown story to implementation tasks follow the instruction from user: ${userInput}
Please follow the search result to breakdown the tasks, and focus on where and how to implement the story.
Below are found classic example of tasking results:
${JSON.stringify(searchResult)}
`;

    return await this.chatCompletion([
      { role: "system", content: prompt },
      {
        role: "user",
        content: `Use markdown format to beautify output, begin to breakdown in ${this.language}:`,
      },
    ]);
  }

  private async search(cardDescription: string): Promise<any> {
    if (this.baCopilotKnowledgeApi.length <= 0) {
      return { total: 0, items: [] };
    }
    const response = await fetch(this.baCopilotKnowledgeApi, {
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

export default BACopilotAgent;
