import React, {
  useState,
  useRef,
  useEffect,
  Fragment,
  useCallback,
} from "react";
import { Input, Layout, theme } from "antd";
import PropTypes from "prop-types";
import MDEditor from "@uiw/react-md-editor";
import { getCodeString } from "rehype-rewrite";
import mermaid from "mermaid";
import "./index.css";
import WriterContext from "@pages/options/writer/context/WriterContext";

const { Header, Content } = Layout;

const randomId = () => parseInt(String(Math.random() * 1e15), 10).toString(36);
const Code = ({ children, className, node }) => {
  children = children ?? [];
  const demoId = useRef(`dome${randomId()}`);
  const [container, setContainer] = useState(null);
  const isMermaid =
    className && /^language-mermaid/.test(className.toLocaleLowerCase());

  const code = children ? getCodeString(node.children) : children[0] || "";

  useEffect(() => {
    if (container && isMermaid && demoId.current && code) {
      mermaid
        .render(demoId.current, code)
        .then(({ svg, bindFunctions }) => {
          container.innerHTML = svg;
          if (bindFunctions) {
            bindFunctions(container);
          }
        })
        .catch((error) => {
          console.error("error:", error);
        });
    }
  }, [container, isMermaid, code, demoId]);

  const refElement = useCallback((element: any) => {
    if (element !== null) {
      setContainer(element);
    }
  }, []);

  if (isMermaid) {
    return (
      <Fragment>
        <code id={demoId.current} style={{ display: "none" }} />
        <code className={className} ref={refElement} data-name="mermaid" />
      </Fragment>
    );
  }
  return <code className={className}>{children}</code>;
};

Code.propTypes = {
  children: PropTypes.arrayOf(PropTypes.any),
  className: PropTypes.string,
  node: PropTypes.any,
};

interface WriterEditorProps {
  context: WriterContext;
}

const WriterEditor: React.FC<WriterEditorProps> = ({ context }) => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const [value, setValue] = useState(context.getContent());
  const [title, setTitle] = useState(context.getTitle());
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  const handleInput = (event: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = event.currentTarget;
    const { selectionStart } = textarea;
    const { left, top } = textarea.getBoundingClientRect();
    const lineHeight = parseInt(
      window.getComputedStyle(textarea).lineHeight,
      10,
    );
    const lines = textarea.value.substr(0, selectionStart).split("\n").length;
    const x = left + textarea.selectionEnd * 8; // Approximate character width
    const y = top + (lines - 1) * lineHeight;
    setCursorPosition({ x, y });
    console.log("Input event:", event, "cursorPosition:", cursorPosition);
  };

  return (
    <Layout style={{ paddingRight: 36 }}>
      <Header style={{ padding: 0, background: colorBgContainer }}>
        <Input
          id="writer-title-input"
          placeholder="Untitled"
          autoComplete="off"
          variant="borderless"
          value={title}
          onChange={(e) => {
            context.setTitle(e.target.value);
            setTitle(e.target.value);
          }}
        />
      </Header>
      <Content
        style={{
          padding: 0,
          margin: 0,
          minHeight: 600,
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
        }}
      >
        <MDEditor
          onChange={(newValue = "") => {
            context.setContent(newValue);
            setValue(newValue);
          }}
          textareaProps={{
            placeholder: "Please enter Markdown text",
            onInput: handleInput,
          }}
          highlightEnable={false}
          height={"100%"}
          value={value}
          previewOptions={{
            components: {
              code: Code,
            },
          }}
        />
      </Content>
    </Layout>
  );
};

export default WriterEditor;
