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
      URL: document.URL,
      columns: this.getBoardCards(),
    };

    return currentBoard;
  }
}

const addCommands = () => {
  if (matchURL("trello.com")) {
    const helper = new TrelloHelper();

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
