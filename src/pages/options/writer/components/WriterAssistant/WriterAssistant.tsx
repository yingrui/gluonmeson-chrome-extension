import React, { useState } from "react";
import { Button, Layout, theme } from "antd";
import { CloseOutlined } from "@ant-design/icons";

import "./WriterAssistant.css";
import WriterContext from "@pages/options/writer/context/WriterContext";

const { Header, Content, Sider } = Layout;

const WriterAssistant: React.FC = (props: Record<string, unknown>) => {
  const context = props.context as WriterContext;

  const [chatCollapsed, setChatCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Sider
      id="writer-right-sider"
      width={400}
      collapsedWidth={64}
      trigger={null}
      collapsible
      collapsed={chatCollapsed}
    >
      <div className="chat">
        <div className="chat-sider-header">
          {chatCollapsed ? null : (
            <>
              <img src="/icons/gm_logo.png" />
              <h6>Chat with Guru</h6>
            </>
          )}
          <Button
            type="text"
            icon={
              chatCollapsed ? (
                <img src="/icons/gm_logo.png" />
              ) : (
                <CloseOutlined />
              )
            }
            onClick={() => setChatCollapsed(!chatCollapsed)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
              float: "right",
            }}
          />
        </div>
        <div
          className="chat-sider-body"
          style={{
            display: chatCollapsed ? "none" : "block",
          }}
        >
          <div className="chat-list"></div>
          <div className="chat-form"></div>
        </div>
      </div>
    </Sider>
  );
};

export default WriterAssistant;
