import React, { useState } from "react";
import type { MenuProps } from "antd";
import { Button, Layout, Menu } from "antd";

import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ProductOutlined,
} from "@ant-design/icons";

import type { GluonConfigure } from "@src/shared/storages/gluonConfig";

import "./index.css";
import intl from "react-intl-universal";
import ElevatorPitchApp from "@pages/options/architect/components/ElevatorPitchApp";

const { Sider } = Layout;

interface ArchitectAppProps {
  config: GluonConfigure;
}

const ArchitectApp: React.FC<ArchitectAppProps> = ({ config }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string>("lv1_1_1");

  const menuItems: MenuProps["items"] = [
    {
      key: "lv1_1",
      icon: <ProductOutlined />,
      label: intl
        .get("options_app_architect_items_product_design")
        .d("Product Design"),
      children: [
        {
          key: "lv1_1_1",
          label: intl
            .get("options_app_architect_items_elevator_pitch")
            .d("Elevator Pitch"),
        },
      ],
    },
  ];

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    setSelectedKey(e.key);
  };

  return (
    <Layout>
      <Sider
        id="architect-left-sider"
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
          defaultSelectedKeys={["lv1_1_1"]}
          defaultOpenKeys={["lv1_1"]}
          items={menuItems}
          style={{ height: "89vh", borderRight: 0 }}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        {selectedKey === "lv1_1_1" && (
          <ElevatorPitchApp config={config}></ElevatorPitchApp>
        )}
      </Layout>
    </Layout>
  );
};

export default ArchitectApp;
