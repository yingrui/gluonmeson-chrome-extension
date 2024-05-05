chrome.runtime.onMessage.addListener((message, sender) => {
  (async () => {
    if (message.type === "open_side_panel") {
      await chrome.sidePanel.open({ tabId: sender.tab.id });
    } else if (message.type === "enable_floating_ball") {
      chrome.tabs.query({}, (result) => {
        const action = message.enabled
          ? chrome.scripting.removeCSS
          : chrome.scripting.insertCSS;
        for (let i = 0; i < result.length; i++) {
          action({
            target: { tabId: result[i].id },
            css: "#gm-floating-ball-container { visibility: hidden; }",
          });
        }
      });
    }
  })();
});
