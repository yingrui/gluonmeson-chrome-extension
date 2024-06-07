## Get Web Page Content
### Step 1: Add util methods
Add `get_content` util method to `src/pages/sidepanel/utils`  
```typescript
export const get_content = async () => {};
```

### Step 2: Implement the `get_content` method
Implement the `get_content` method in the util file. 
* Firstly, it queries the active tab in the current window. 
* Then it sends a message to the content script to get the content of the page. 
* Finally, it resolves the promise with the response.
```typescript
export const get_content = async () => {
  return new Promise<any>(function (resolve, reject) {
    chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
      chrome.tabs.sendMessage( tabs[0].id, { type: "get_content" }, (response) => {
          resolve(response);
        },
      );
    });
  });
};
```

### Step 3: Add `get_content` message handler to the content script
Add a message handler to the content script `pages/content/injected/listeners/common/commands.ts` to handle the `get_content` message. 
```typescript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    // Add message handler for get_content
    if (message.type === "get_content") {
      sendResponse({
        title: document.title,
        text: document.body.innerText,
        url: document.URL,
      });
    }
  })();
});
```
Or you can use the following code snippet to get the content of the page.
```typescript
chrome.scripting.executeScript({
  target: { tabId: tabId },
  function: () => {
    return document.activeElement.textContent;
  },
});
```