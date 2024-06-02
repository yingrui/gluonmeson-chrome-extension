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
