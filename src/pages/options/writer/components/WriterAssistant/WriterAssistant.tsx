import React, { useState } from "react";
import { Button, Layout, theme } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";

import "./WriterAssistant.css";

const { Header, Content, Sider } = Layout;

const WriterAssistant: React.FC = () => {
  const [chatCollapsed, setChatCollapsed] = useState(true);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Sider
      id="writer-right-sider"
      width={400}
      collapsedWidth={64}
      style={{ height: "auto" }}
      trigger={null}
      collapsible
      collapsed={chatCollapsed}
    >
      <div className="chat-sider">
        <Button
          type="text"
          icon={chatCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setChatCollapsed(!chatCollapsed)}
          style={{
            fontSize: "16px",
            width: 64,
            height: 64,
            float: "right",
          }}
        />
      </div>
    </Sider>
  );
};

export default WriterAssistant;
