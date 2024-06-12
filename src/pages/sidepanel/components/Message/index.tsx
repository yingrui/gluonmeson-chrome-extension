import { Spin } from "antd";
import "./index.css";
import CodeBlock from "@pages/sidepanel/components/Message/MarkDownBlock/CodeBlock";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMermaid from "remark-mermaidjs";
import remarkGfm from "remark-gfm";

interface Props {
  role: ChatMessage["role"];
  content: string;
}

const rehypePlugins = [rehypeKatex];
const remarkPlugins = [remarkGfm, remarkMermaid];

const Message = (props: Props) => {
  const { role, content } = props;
  const isAssistant = role === "assistant";
  return (
    <div className={`message-item ${isAssistant ? "message-assistant" : ""}`}>
      {isAssistant && <img className="bot-avatar" src="/icons/gm_logo.png" />}
      {content ? (
        <div
          className={`message-content ${isAssistant ? "bot-message-content" : "user-message-content"}`}
        >
          <ReactMarkdown
            components={{ code: CodeBlock }}
            rehypePlugins={rehypePlugins as any}
            remarkPlugins={remarkPlugins as any}
          >
            {content}
          </ReactMarkdown>
        </div>
      ) : (
        <div className="message-spin">
          <Spin />
        </div>
      )}
      {!isAssistant && (
        <img className="user-avatar" src="/icons/user-icon.png" />
      )}
    </div>
  );
};

export default Message;
