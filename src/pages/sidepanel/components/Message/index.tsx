import { Spin } from "antd";
import "./index.css";
import CodeBlock from "@pages/sidepanel/components/Message/MarkDownBlock/CodeBlock";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import remarkMermaid from "remark-mermaidjs";
import remarkGfm from "remark-gfm";

interface Props {
  role: ChatMessage["role"];
  content: string;
}

const rehypePlugins = [rehypeKatex, [rehypeHighlight, { ignoreMissing: true }]];
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
          <Markdown
            components={{ code: CodeBlock }}
            rehypePlugins={rehypePlugins}
            remarkPlugins={remarkPlugins}
          >
            {content}
          </Markdown>
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
