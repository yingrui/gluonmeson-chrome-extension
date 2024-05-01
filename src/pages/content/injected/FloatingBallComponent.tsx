import { useState } from "react";
import Draggable from "react-draggable";

export default function FloatingBallComponent() {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    chrome.runtime.sendMessage({ type: "open_side_panel" });
  };

  const iconSrc = chrome.runtime.getURL("icons/gm_logo.png");
  return (
    <Draggable axis="y">
      <div
        className={`floating-window ${isHovered ? "hovered" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img src={iconSrc} alt="icon" onClick={handleClick} />
      </div>
    </Draggable>
  );
}
