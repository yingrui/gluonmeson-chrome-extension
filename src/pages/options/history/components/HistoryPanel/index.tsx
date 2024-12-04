import React, { useState } from "react";
import type { TableProps } from "antd";
import { Space, Table, Tag } from "antd";
import type { GluonConfigure } from "@src/shared/storages/gluonConfig";
import "./index.css";
import LocalConversationRepository, {
  ConversationRecord,
} from "@src/shared/repositories/LocalConversationRepository";

const columns: TableProps<ConversationRecord>["columns"] = [
  {
    title: "Uuid",
    dataIndex: "uuid",
    key: "uuid",
    render: (text) => text.substring(0, 8).toLowerCase(),
  },
  {
    title: "Time",
    dataIndex: "datetime",
    key: "datetime",
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
    dataIndex: "recordStatus",
    key: "recordStatus",
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

const HistoryPanel: React.FC<HistoryPanelProps> = ({ config, historyType }) => {
  const [records, setRecords] = useState<ConversationRecord[]>([]);
  const repository = new LocalConversationRepository();

  const getRecords = async () => {
    if (records.length === 0) {
      setRecords(await repository.findAll());
    }
  };
  getRecords();

  return (
    <div className={"history-table"}>
      <Table<ConversationRecord>
        columns={columns}
        dataSource={records}
        bordered
        footer={() => ""}
      />
    </div>
  );
};

export default HistoryPanel;
