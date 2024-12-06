import React, { useState } from "react";
import { Button, Layout, Menu, type MenuProps, Radio } from "antd";
import type { GluonConfigure } from "@src/shared/storages/gluonConfig";
import "./index.css";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import HistoryPanel from "@pages/options/history/components/HistoryPanel";

const { Sider } = Layout;

const ConversationsItemKey = "Conversations";
const DatasetsItemKey = "Datasets";

interface HistoryAppProps {
  config: GluonConfigure;
}

const HistoryApp: React.FC<HistoryAppProps> = ({ config }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedItem, setSelectedItem] =
    useState<string>(ConversationsItemKey);

  const historyTypeItems: MenuProps["items"] = [
    { key: ConversationsItemKey, label: "Conversations" },
    { key: DatasetsItemKey, label: "Datasets" },
  ];

  const handleMenuClick = (item: string) => {
    setSelectedItem(item);
  };

  return (
    <Layout id={"history-app"}>
      <Sider
        id="history-left-sider"
        width={300}
        collapsedWidth={64}
        style={{ height: "auto" }}
        trigger={null}
        collapsible
        collapsed={collapsed}
      >
        <div className="left-sider-title">
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
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[selectedItem]}
          items={historyTypeItems}
          style={{ height: "89vh", borderRight: 0 }}
          onClick={(e) => handleMenuClick(e.key)}
        />
      </Sider>
      <HistoryPanel config={config} historyType={selectedItem} />
    </Layout>
  );
};

export default HistoryApp;