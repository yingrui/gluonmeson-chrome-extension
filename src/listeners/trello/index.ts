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
