import OpenAI from "openai";
import { matchURL } from "@pages/content/injected/listeners/utils";
import jQuery from "jquery";

class TrelloHelper {
  client: OpenAI;

  constructor() {
    this.client = new OpenAI({ apiKey: "", dangerouslyAllowBrowser: true });
  }

  private getBoardTitle(): string {
    const board = jQuery('[data-testid="board-name-display"]');
    return board ? board.text() : document.title;
  }

  private getColumn(column: any): any {
    const name = jQuery(column).find("h2").first().text();
    const cards = jQuery(column)
      .find('a[data-testid="card-name"]')
      .map((id, a) => {
        return { name: a.text, href: a.href };
      })
      .get();

    return { name: name, cards: cards };
  }

  private getBoardCards(): any {
    const columns = jQuery("ol[id='board'] li[data-testid='list-wrapper']");
    return columns
      .map((id, li) => {
        return this.getColumn(li);
      })
      .get();
  }

  getCurrentBoard(): any {
    const currentBoard = {
      title: this.getBoardTitle(),
      url: document.URL,
      columns: this.getBoardCards(),
    };

    return currentBoard;
  }
}

const addCommands = () => {
  if (matchURL("trello.com")) {
    const helper = new TrelloHelper();

    document.addEventListener("keydown", function (event) {
      if (event.shiftKey && event.altKey && event.key === "Enter") {
        // Open side panel when press alt+enter
        chrome.runtime.sendMessage({
          type: "command_from_content_script",
          command: {
            name: "trello",
            userInput: "generate story content",
            tool: "generate_story",
            args: {
              title:
                "Generate story content for user before they want to create a new card in Trello board",
            },
            url: document.URL,
            date: new Date().toISOString(),
          },
        });
      }
    });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      (async () => {
        if (message.type === "get_trello_board") {
          sendResponse(helper.getCurrentBoard());
        }
      })();
    });
  }
};

addCommands();
