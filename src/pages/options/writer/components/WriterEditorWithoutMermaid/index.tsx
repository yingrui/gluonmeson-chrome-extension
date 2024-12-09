import React, { useState } from "react";
import { Input, Layout, theme } from "antd";

import MDEditor from "@uiw/react-md-editor";
import "./index.css";
import WriterContext from "@pages/options/writer/context/WriterContext";
import intl from "react-intl-universal";

const { Header, Content } = Layout;

interface WriterEditorWithoutMermaidProps {
  context: WriterContext;
}

const WriterEditor: React.FC<WriterEditorWithoutMermaidProps> = ({
  context,
}) => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const [value, setValue] = useState(context.getContent());
  const [title, setTitle] = useState(context.getTitle());

  return (
    <Layout style={{ paddingRight: 36 }}>
      <Header style={{ padding: 0, background: colorBgContainer }}>
        <Input
          id="writer-title-input"
          placeholder={intl
            .get("options_app_writer_title_placeholder")
            .d("Untitled")}
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
            placeholder: intl
              .get("options_app_writer_content_placeholder")
              .d("Please enter Markdown text"),
          }}
          height={"100%"}
          value={value}
        />
      </Content>
    </Layout>
  );
};

export default WriterEditor;
