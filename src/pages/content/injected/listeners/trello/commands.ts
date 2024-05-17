import OpenAI from "openai";
import { matchURL } from '@pages/content/injected/listeners/utils';

console.log(OpenAI, 'inject ui');

const addCommands = () => {
  if(matchURL('trello.com')) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      (async () => {
        if (message.type === "get_trello_board") {
          sendResponse({
            title: document.title,
            text: document.body.innerText,
            URL: document.URL,
          });
        }
      })();
    });
  }
}

addCommands()
