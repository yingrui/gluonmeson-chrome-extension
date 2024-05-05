import { createRoot } from "react-dom/client";
import refreshOnUpdate from "virtual:reload-on-update-in-view";
import FloatingBallComponent from "./FloatingBallComponent";
import injectedStyle from "./floatingBallComponent.css?inline";
import { CONFIG_STAORAGE_KEY } from "../../popup/Popup";

refreshOnUpdate("pages/content/injected/initBall");

const root = document.createElement("div");
root.id = "gm-floating-ball-container";

document.body.append(root);

const rootIntoShadow = document.createElement("div");
rootIntoShadow.id = "gm-floating-ball-shadow-root";

const shadowRoot = root.attachShadow({ mode: "open" });
shadowRoot.appendChild(rootIntoShadow);

/** Inject styles into shadow dom */
const styleElement = document.createElement("style");
styleElement.innerHTML = injectedStyle;
shadowRoot.appendChild(styleElement);
createRoot(rootIntoShadow).render(<FloatingBallComponent />);

chrome.storage.local.get(CONFIG_STAORAGE_KEY, function (items) {
  if (items?.[CONFIG_STAORAGE_KEY]) {
    chrome.runtime.sendMessage({
      type: "enable_floating_ball",
      enabled: items?.[CONFIG_STAORAGE_KEY].enableFloatingBall,
    });
  }
});