import OpenAI from "openai";
import { matchURL } from '@pages/content/injected/listeners/utils';

console.log(OpenAI, 'inject common listener');

const addCommands = () => {
  if(matchURL('*')) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      (async () => {
        if (message.type === "get_content") {
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
