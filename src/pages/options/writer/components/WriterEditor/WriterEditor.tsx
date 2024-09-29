import React, {
  useState,
  useRef,
  useEffect,
  Fragment,
  useCallback,
} from "react";
import { Button, Input, Layout, Menu, Radio, theme } from "antd";
import type { MenuProps } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LaptopOutlined,
  NotificationOutlined,
} from "@ant-design/icons";

import MDEditor from "@uiw/react-md-editor";
import { getCodeString } from "rehype-rewrite";
import mermaid from "mermaid";
import "./WriterEditor.css";
import WriterContext from "@pages/options/writer/context/WriterContext";

const { Header, Content, Sider } = Layout;

const randomid = () => parseInt(String(Math.random() * 1e15), 10).toString(36);
const Code: React.FC = (props: Record<string, unknown>) => {
  const children = props.children ?? [];
  const className = props.className;
  const demoid = useRef(`dome${randomid()}`);
  const [container, setContainer] = useState(null);
  const isMermaid =
    className && /^language-mermaid/.test(className.toLocaleLowerCase());
  const code = children
    ? getCodeString(props.node.children)
    : children[0] || "";

  useEffect(() => {
    if (container && isMermaid && demoid.current && code) {
      mermaid
        .render(demoid.current, code)
        .then(({ svg, bindFunctions }) => {
          container.innerHTML = svg;
          if (bindFunctions) {
            bindFunctions(container);
          }
        })
        .catch((error) => {
          console.log("error:", error);
        });
    }
  }, [container, isMermaid, code, demoid]);

  const refElement = useCallback((node) => {
    if (node !== null) {
      setContainer(node);
    }
  }, []);

  if (isMermaid) {
    return (
      <Fragment>
        <code id={demoid.current} style={{ display: "none" }} />
        <code className={className} ref={refElement} data-name="mermaid" />
      </Fragment>
    );
  }
  return <code className={className}>{children}</code>;
};

const WriterEditor: React.FC = (props: Record<string, unknown>) => {
  const context = props.context as WriterContext;
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const [value, setValue] = useState(context.getContent());
  const [title, setTitle] = useState(context.getTitle());

  return (
    <Layout style={{ paddingRight: 64 }}>
      <Header style={{ padding: 0, background: colorBgContainer }}>
        <Input
          id="writer-title-input"
          placeholder="Untitled"
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
          }}
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
