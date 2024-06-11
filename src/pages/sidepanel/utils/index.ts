export const delay = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));

export const get_content = async () => {
  return new Promise<any>(function (resolve, reject) {
    // send message to content script, call resolve() when received response"
    chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { type: "get_content" },
        (response) => {
          resolve(response);
        },
      );
    });
  });
};

let listenerInstalled = false;
export const installListener = (handler) => {
  if (listenerInstalled) return;

  listenerInstalled = true;
  chrome.storage.session.onChanged.addListener(async (changes) => {
    const data = await chrome.storage.session.get();
    const command = data["command_from_content_script"];
    if (command) {
      handler(command.tool, command.args, command.userInput);
    }
  });
};
