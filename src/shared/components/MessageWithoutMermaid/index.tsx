import { Spin, message } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import "./index.css";
import CodeBlock from "@src/shared/components/MessageWithoutMermaid/MarkDownBlockWithoutMermaid/CodeBlock";
import ReactMarkdown from "react-markdown";
import copy from "copy-to-clipboard";
import Interaction from "@src/shared/agents/core/Interaction";
import React, { useState } from "react";
import ChatMessage from "@src/shared/agents/core/ChatMessage";
import type { MessageContent } from "@src/shared/agents/core/ChatMessage";

interface MessageProps {
  index?: number;
  role: ChatMessage["role"];
  content: string | MessageContent[];
  name?: string;
  loading?: boolean;
  interaction?: Interaction;
}

const rehypePlugins = [];
const remarkPlugins = [];

const Message: React.FC<MessageProps> = React.memo((props: MessageProps) => {
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

  function shouldSpin(): boolean {
    return (
      isAssistant && interaction && interaction.getStatus() !== "Completed"
    );
  }

  return (
    <div className={`message-item ${isAssistant ? "message-assistant" : ""}`}>
      {isAssistant && (
        <div className="avatar">
          <img className="bot-avatar" src="/icons/gm_logo.png" />
          <span>{name}</span>
        </div>
      )}
      <div
        className={`message-content ${isAssistant ? "bot-message-content" : "user-message-content"}`}
      >
        {shouldSpin() && (
          // When content is empty
          <div className={"message-spin"}>
            <Spin />
            {interaction && (
              <span className={"interaction-status"}>{statusMessage}</span>
            )}
          </div>
        )}
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
      {!isAssistant && (
        <img className="user-avatar" src="/icons/user-icon.png" />
      )}
    </div>
  );
});

Message.displayName = "Message";

export default Message;
