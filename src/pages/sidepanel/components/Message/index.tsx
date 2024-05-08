import { Spin } from "antd";
import "./index.css";
import Markdown from "react-markdown";
import CodeBlock from "@pages/sidepanel/components/Message/MarkDownBlock/CodeBlock";

interface Props {
  role: ChatMessage["role"];
  content: string;
}

const Message = (props: Props) => {
  const { role, content } = props;
  const isAssistant = role === "assistant";
  return (
    <div className={`message-item ${isAssistant ? "message-assistant" : ""}`}>
      {isAssistant && <img className="bot-avatar" src="/icons/gm_logo.png" />}

      <div
        className={`message-content ${isAssistant ? "bot-message-content" : "user-message-content"}`}
      >
        {content ? (
          <Markdown components={{ code: CodeBlock }}>{content}</Markdown>
        ) : (
          <>
            <Spin />
          </>
        )}
      </div>
      {!isAssistant && (
        <img className="user-avatar" src="/icons/user-icon.png" />
      )}
    </div>
  );
};

export default Message;
