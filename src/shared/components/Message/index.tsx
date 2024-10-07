import { Spin, message } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import "./index.css";
import CodeBlock from "@src/shared/components/Message/MarkDownBlock/CodeBlock";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import copy from "copy-to-clipboard";

interface Props {
  index?: number;
  role: ChatMessage["role"];
  content: string;
  name?: string;
  loading?: boolean;
}

const rehypePlugins = [rehypeKatex];
const remarkPlugins = [remarkGfm];

const Message = (props: Props) => {
  const { index, role, content, loading, name } = props;
  const isAssistant = role === "assistant";

  function handleCopy() {
    copy(content, {});
    message.success("copy success");
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
            {content}
          </ReactMarkdown>
          {isAssistant && !loading && index > 0 && (
            <div>
              <CopyOutlined className="copy-icon" onClick={handleCopy} />
            </div>
          )}
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
