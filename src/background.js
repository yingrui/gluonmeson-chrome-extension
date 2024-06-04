chrome.runtime.onMessage.addListener((message, sender) => {
  (async () => {
    if (message.type === "open_side_panel") {
      await chrome.sidePanel.open({ tabId: sender.tab.id });
    }
    // Store the command from the content script in session storage, so that the side panel can access it
    // Since the message have timestamp, so the side panel will be noticed everytime the command is sent
    if (message.type === "command_from_content_script") {
      // Make sure the side panel is opened
      await chrome.sidePanel.open({ tabId: sender.tab.id });
      chrome.storage.session.set({
        command_from_content_script: message.command,
      });
    }
  })();
});

// A generic onclick callback function.
chrome.contextMenus.onClicked.addListener(genericOnClick);

function genericOnClick(info, tab) {
  if (info.editable) {
    if (info.menuItemId === "generate_text") {
      // Get the editing text
      getActiveElementTextContent(tab.id).then((results) => {
        const textContent = results[0].result;
        chrome.storage.session.set({
          command_from_content_script: {
            name: "GluonMeson",
            userInput: "generate text",
            tool: "generate_text",
            args: {
              userInput: textContent,
            },
            date: new Date().toISOString(),
          },
        });
      });
    }
  } else {
    console.log("Context menu item clicked.", info);
  }
}

function getActiveElementTextContent(tabId) {
  return chrome.scripting.executeScript({
    target: { tabId: tabId },
    function: () => {
      return document.activeElement.textContent;
    },
  });
}

chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    title: "Generate Text",
    contexts: ["editable"],
    id: "generate_text",
  });
});
