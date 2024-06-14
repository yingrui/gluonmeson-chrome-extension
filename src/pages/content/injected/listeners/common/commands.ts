import {
  matchURL,
  getContentSelector,
} from "@pages/content/injected/listeners/utils";
import jQuery from "jquery";

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
          const url = document.URL;
          const selector = getContentSelector(url);
          sendResponse({
            url: url,
            title: document.title,
            text: jQuery(selector).text(),
          });
        }
      })();
    });
  }
};

addCommands();
