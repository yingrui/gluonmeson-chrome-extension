import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coy } from "react-syntax-highlighter/dist/cjs/styles/prism";
import React, { HTMLAttributes } from "react";
import { CopyOutlined } from "@ant-design/icons";
import style from "./CodeBlock.module.scss";
import { message } from "antd";
import Mermaid from "./MermaidBlock";
import copy from "copy-to-clipboard";

function CodeBlock(
  props: HTMLAttributes<HTMLElement> & { isStreaming?: boolean },
) {
  const { children, className, ...rest } = props;
  const match = /language-(\w+)/.exec(className || "");
  const text = String(children).replace(/\n$/, "");

  const handleCopy = () => {
    copy(text, {});
    message.success("copy success");
  };

  const isMermaid = match && match[1] === "mermaid";

  return match ? (
    <div className={style.block}>
      {isMermaid ? (
        <Mermaid chart={children} isStreaming={props.isStreaming} />
      ) : (
        <SyntaxHighlighter
          {...rest}
          PreTag="div"
          language={match[1]}
          style={coy}
        >
          {text}
        </SyntaxHighlighter>
      )}
      <CopyOutlined className={style.copy} onClick={handleCopy} />
    </div>
  ) : (
    <code {...rest} className={className}>
      {children}
    </code>
  );
}

CodeBlock.defaultProps = {
  language: null,
};

export default CodeBlock;
