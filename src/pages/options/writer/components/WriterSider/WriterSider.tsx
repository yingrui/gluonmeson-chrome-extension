import React, { useState } from "react";
import type { TreeDataNode } from "antd";
import { Button, Layout, Radio, Tree } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";

import "./WriterSider.css";
import WriterContext from "@pages/options/writer/context/WriterContext";
import intl from "react-intl-universal";

const { Sider } = Layout;

interface WriterSiderProps {
  context: WriterContext;
}

const WriterSider: React.FC<WriterSiderProps> = ({ context }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState("Outline");
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);

  context.onOutlineChange((outline) => {
    setTreeData(outline);
  });

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
          <Radio.Group value={selectedPanel}>
            <Radio.Button
              value="Outline"
              onClick={() => setSelectedPanel("Outline")}
            >
              {intl.get("options_app_writer_outline").d("Outline")}
            </Radio.Button>
            <Radio.Button
              value="Reference"
              onClick={() => setSelectedPanel("Reference")}
            >
              {intl.get("options_app_writer_reference").d("Reference")}
            </Radio.Button>
          </Radio.Group>
        )}
      </div>
      <div className={"writer-menu"}>
        {selectedPanel === "Outline" && (
          <Tree
            className={"outline-tree"}
            treeData={treeData}
            defaultExpandAll={true}
          />
        )}
      </div>
    </Sider>
  );
};

export default WriterSider;
