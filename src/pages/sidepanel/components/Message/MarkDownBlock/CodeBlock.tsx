import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coy } from "react-syntax-highlighter/dist/cjs/styles/prism";
import React, { HTMLAttributes } from "react";
import { CopyOutlined } from "@ant-design/icons";
import style from "./CodeBlock.module.scss";
import { Button, message } from "antd";
import copy from "copy-to-clipboard";

function CodeBlock(props: HTMLAttributes<HTMLElement>) {
  const { children, className, ...rest } = props;
  const match = /language-(\w+)/.exec(className || "");
  const text = String(children).replace(/\n$/, "");

  const handleCopy = () => {
    copy(text, {});
    message.success("copy success");
  };

  return match ? (
    <div className={style.block}>
      <SyntaxHighlighter {...rest} PreTag="div" language={match[1]} style={coy}>
        {text}
      </SyntaxHighlighter>
      <Button icon={<CopyOutlined />} onClick={handleCopy}></Button>
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
