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
