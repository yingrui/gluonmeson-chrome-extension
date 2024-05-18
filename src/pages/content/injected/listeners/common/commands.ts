import { matchURL } from "@pages/content/injected/listeners/utils";

const addCommands = () => {
  if (matchURL("*")) {
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
};

addCommands();
