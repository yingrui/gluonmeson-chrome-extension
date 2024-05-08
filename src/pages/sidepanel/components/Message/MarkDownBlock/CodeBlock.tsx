import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coy } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { HTMLAttributes } from "react";

function CodeBlock(props: HTMLAttributes<HTMLElement>) {
  const { children, className, ...rest } = props;
  const match = /language-(\w+)/.exec(className || "");
  const text = String(children).replace(/\n$/, "");
  return match ? (
    <div>
      <SyntaxHighlighter {...rest} PreTag="div" language={match[1]} style={coy}>
        {text}
      </SyntaxHighlighter>
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
