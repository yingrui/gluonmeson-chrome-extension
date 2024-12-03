import React, { useState } from "react";
import { Space, Table, Tag } from "antd";
import type { TableProps } from "antd";
import type { GluonConfigure } from "@src/shared/storages/gluonConfig";
import "./index.css";

interface DataType {
  key: string;
  uuid: string;
  time: string;
  rounds: number;
  status: "Kept" | "Plan to delete";
  states: string[];
}

const columns: TableProps<DataType>["columns"] = [
  {
    title: "Uuid",
    dataIndex: "uuid",
    key: "uuid",
    render: (text) => text.substring(0, 8).toLowerCase(),
  },
  {
    title: "Time",
    dataIndex: "time",
    key: "time",
  },
  {
    title: "Rounds",
    dataIndex: "rounds",
    key: "rounds",
  },
  {
    title: "Dialogue States Tracking",
    key: "states",
    dataIndex: "states",
    render: (_, { states }) => (
      <>
        {states.map((state) => {
          return (
            <Tag color={"green"} key={state}>
              {state}
            </Tag>
          );
        })}
      </>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
  },
  {
    title: "Action",
    key: "action",
    render: (_, record) => (
      <Space size="middle">
        <a>View</a>
        <a>Keep</a>
        <a>Delete</a>
      </Space>
    ),
  },
];

interface HistoryPanelProps {
  config: GluonConfigure;
  historyType: string;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ config }) => {
  const data: DataType[] = [
    {
      key: "1",
      uuid: "1A8A5F26-6726-40B1-878C-044C74FA88F2",
      time: "2024-12-01T00:01:20+8",
      rounds: 2,
      status: "Plan to delete",
      states: ["summary", "search"],
    },
    {
      key: "2",
      uuid: "3D4CC3EF-D47E-4D2F-B968-DC9E92B8D72A",
      time: "2024-12-01T00:02:20+8",
      rounds: 2,
      status: "Plan to delete",
      states: ["search", "translate"],
    },
    {
      key: "3",
      uuid: "CB393184-2691-46C0-9C73-ECDAC89CBC17",
      time: "2024-12-01T00:08:20+8",
      rounds: 3,
      status: "Plan to delete",
      states: ["summary", "search", "chat"],
    },
  ];

  return (
    <div className={"history-table"}>
      <Table<DataType>
        columns={columns}
        dataSource={data}
        bordered
        footer={() => ""}
      />
    </div>
  );
};

export default HistoryPanel;
