import { matchURL } from "@pages/content/injected/listeners/utils";

const addCommands = () => {
  if (matchURL("*")) {
    document.addEventListener("keydown", function (event) {
      if (event.altKey && event.key === "Enter") {
        // Open side panel when press alt+enter
        chrome.runtime.sendMessage({ type: "open_side_panel" });
      }
    });

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
