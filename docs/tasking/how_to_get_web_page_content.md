## Get Web Page Content
This task provides a util method to get the content of the current web page.

* Most of utils are implemented in `index.ts` (located in corresponding `/utils` folder).
* Add a new util method to send message to and wait for the response (include text and links) from content script.
* If you want to remove the advertisement from the page, you can provide selectors to content script, so content script can extract better content according to selectors.

### Tasking
1. Add a `get_content` method to the `src/pages/sidepanel/utils` directory.
2. Get current tab and send message to content script.
3. Add `get_content` message handler to the content script.
4. Get text and links from the page according to the selector.
5. Provide selectors for specified website.
6. Send the response to the message sender.

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
      const url = document.URL;
      const selector = getSelectorSettings(url);
      const elements = jQuery(selector.contentSelector);
      // Get innerText of the first element if there is any, otherwise get innerText of the body
      const content = elements && elements.length > 0 ? elements[0].innerText : document.body.innerText;
      // Get links from the page according to the selector, if selector is empty, return empty array
      const links = getLinks(selector.linkSelector);
      sendResponse({
        url: url,
        title: document.title,
        text: content,
        links: links,
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

### Step 4: Provide selectors to content script
Since the content script needs to extract the content from the page, you can provide selectors in file `pages/content/injected/listeners/utils/index.ts` to the content script.

For example, you can provide selectors for Google search result page and StackOverflow page as below.
```typescript
const selectors = [
  {
    regex: /^https:\/\/www.google.com\/search.*/,
    contentSelector: "#rcnt",
    linkSelector: 'a:visible[jsname="UWckNb"]',
  },
  {
    regex: /^https:\/\/stackoverflow.com\/questions\/.*/,
    contentSelector: "#mainbar",
  },
  ...
];
```
