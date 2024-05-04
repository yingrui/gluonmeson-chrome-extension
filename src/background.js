chrome.runtime.onMessage.addListener((message, sender) => {
  (async () => {
    if (message.type === "open_side_panel") {
      await chrome.sidePanel.open({ tabId: sender.tab.id });
    } else if (message.type === "enable_floating_ball") {
      const tab = await getCurrentTab();
      const action = message.enabled
        ? chrome.scripting.removeCSS
        : chrome.scripting.insertCSS;
      action({
        target: { tabId: tab.id },
        css: "#gm-floating-ball-container { visibility: hidden; }",
      });
    }
  })();
});

async function getCurrentTab() {
  const queryOptions = { active: true, currentWindow: true };
  const [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}
