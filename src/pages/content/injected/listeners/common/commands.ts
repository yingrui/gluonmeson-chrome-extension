import {
  matchURL,
  getSelectorSettings,
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

    const getLinks = (linkSelector: string) => {
      if (linkSelector) {
        const links = jQuery(linkSelector);
        if (links) {
          return links
            .map((id, link) => {
              return {
                text: jQuery(link).text(),
                href: jQuery(link).attr("href"),
              };
            })
            .get();
        }
      }
      return [];
    };

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      (async () => {
        // Get content from the page
        if (message.type === "get_content") {
          const url = document.URL;
          const selector = getSelectorSettings(url);
          const elements = jQuery(selector.contentSelector);
          // Get innerText of the first element if there is any, otherwise get innerText of the body
          const content =
            elements && elements.length > 0
              ? elements[0].innerText
              : document.body.innerText;
          // Get links from the page according to the selector, if selector is empty, return empty array
          const links = getLinks(selector.linkSelector);
          sendResponse({
            url: url,
            title: document.title,
            text: content,
            links: links,
          });
        } else if (message.type === "get_html") {
          const bodyClone = document.querySelector("body").cloneNode(true);
          (bodyClone as HTMLElement)
            .querySelectorAll("script, svg, style")
            .forEach((elem) => elem.remove());
          sendResponse({
            url: document.URL,
            title: document.title,
            html: (bodyClone as HTMLElement).innerHTML,
          });
        }
      })();
    });
  }
};

addCommands();
