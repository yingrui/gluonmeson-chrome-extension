import { Spin, message } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import "./index.css";
import CodeBlock from "@src/shared/components/Message/MarkDownBlock/CodeBlock";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import copy from "copy-to-clipboard";
import Interaction from "@src/shared/agents/Interaction";
import { useState } from "react";
import ChatMessage from "@src/shared/agents/ChatMessage";
import type { MessageContent } from "@src/shared/agents/ChatMessage";

interface Props {
  index?: number;
  role: ChatMessage["role"];
  content: string | MessageContent[];
  name?: string;
  loading?: boolean;
  interaction?: Interaction;
}

const rehypePlugins = [rehypeKatex];
const remarkPlugins = [remarkGfm];

const Message = (props: Props) => {
  const { index, role, content, loading, name, interaction } = props;
  const isAssistant = role === "assistant";
  const [statusMessage, setStatusMessage] = useState<string>(
    interaction ? interaction.getStatusMessage() : "",
  );

  function getContent(): string {
    if (content instanceof Array) {
      return content.find((c) => c.type === "text")?.text;
    }
    return content as string;
  }

  function handleCopy() {
    copy(getContent(), {});
    message.success("copy success");
  }

  if (interaction) {
    interaction.onChange(() => {
      setStatusMessage(interaction.getStatusMessage());
    });
  }

  return (
    <div className={`message-item ${isAssistant ? "message-assistant" : ""}`}>
      {isAssistant && (
        <div className="avatar">
          <img className="bot-avatar" src="/icons/gm_logo.png" />
          <span>{name}</span>
        </div>
      )}
      {content ? (
        <div
          className={`message-content ${isAssistant ? "bot-message-content" : "user-message-content"}`}
        >
          <ReactMarkdown
            components={{
              code: (props) => {
                return <CodeBlock {...props} loading={loading} />;
              },
            }}
            rehypePlugins={rehypePlugins as any}
            remarkPlugins={remarkPlugins as any}
          >
            {getContent()}
          </ReactMarkdown>
          {isAssistant && !loading && index > 0 && (
            <div>
              <CopyOutlined className="copy-icon" onClick={handleCopy} />
            </div>
          )}
        </div>
      ) : (
        // When content is empty
        <div className="message-spin">
          <Spin />
          {interaction && (
            <span className={"interaction-status"}>{statusMessage}</span>
          )}
        </div>
      )}
      {!isAssistant && (
        <img className="user-avatar" src="/icons/user-icon.png" />
      )}
    </div>
  );
};

export default Message;
