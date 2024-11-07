import React, { useState } from "react";
import { Button, Layout, Menu, Radio } from "antd";
import type { MenuProps } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LaptopOutlined,
  NotificationOutlined,
} from "@ant-design/icons";

import "./WriterSider.css";
import WriterContext from "@pages/options/writer/context/WriterContext";

const chapters: MenuProps["items"] = [
  UserOutlined,
  LaptopOutlined,
  NotificationOutlined,
].map((icon, index) => {
  const key = String(index + 1);

  return {
    key: `sub${key}`,
    //       icon: React.createElement(icon),
    label: `Chapter ${key}`,

    children: new Array(4).fill(null).map((_, j) => {
      const subKey = index * 4 + j + 1;
      return {
        key: subKey,
        label: `Section ${subKey}`,
      };
    }),
  };
});

const { Sider } = Layout;

interface WriterSiderProps {
  context: WriterContext;
}

const WriterSider: React.FC<WriterSiderProps> = ({ context }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Sider
      id="writer-left-sider"
      width={300}
      collapsedWidth={64}
      style={{ height: "auto" }}
      trigger={null}
      collapsible
      collapsed={collapsed}
    >
      <div className="outline-and-reference">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          style={{
            fontSize: "16px",
            width: 64,
            height: 64,
          }}
        />
        {collapsed ? null : (
          <Radio.Group value={"Outline"}>
            <Radio.Button value="Outline">Outline</Radio.Button>
            <Radio.Button value="Reference">Reference</Radio.Button>
          </Radio.Group>
        )}
      </div>
      <Menu
        theme="light"
        mode="inline"
        defaultSelectedKeys={["1"]}
        items={chapters}
        style={{ height: "89vh", borderRight: 0 }}
      />
    </Sider>
  );
};

export default WriterSider;
