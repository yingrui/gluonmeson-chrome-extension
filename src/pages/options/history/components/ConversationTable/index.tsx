import React, { useState } from "react";
import type { TableColumnsType } from "antd";
import { Space, Table, Tag } from "antd";
import type { GluonConfigure } from "@src/shared/storages/gluonConfig";
import LocalConversationRepository, {
  ConversationRecord,
  InteractionRecord,
} from "@src/shared/repositories/LocalConversationRepository";

const interactionColumns: TableColumnsType<InteractionRecord> = [
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
    title: "Agent",
    dataIndex: "agentName",
    key: "agentName",
  },
  {
    title: "Question",
    dataIndex: "inputMessage",
    key: "inputMessage",
    render: (msg: ChatMessage) => msg.content,
  },
  {
    title: "Answer",
    dataIndex: "outputMessage",
    key: "outputMessage",
    render: (msg: ChatMessage) => (msg ? msg.content : ""),
  },
  {
    title: "State",
    dataIndex: "state",
    key: "state",
    render: (s: string) => (
      <Tag color={"green"} key={s}>
        {s}
      </Tag>
    ),
  },
];

const expandedRowRender = (record: ConversationRecord) => {
  return (
    <Table<InteractionRecord>
      columns={interactionColumns}
      dataSource={record.interactions}
      pagination={false}
    />
  );
};

interface ConversationTableProps {
  config: GluonConfigure;
}

const ConversationTable: React.FC<ConversationTableProps> = ({ config }) => {
  const [records, setRecords] = useState<ConversationRecord[]>([]);
  const repository = new LocalConversationRepository();

  const getRecords = async () => {
    if (records.length === 0) {
      setRecords(await repository.findAll());
    }
  };
  getRecords();

  const deleteRecord = async (record: ConversationRecord) => {
    await repository.delete(record.key);
    setRecords(await repository.findAll());
  };

  const columns: TableColumnsType<ConversationRecord> = [
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
          <a>Keep</a>
          <a onClick={(e) => deleteRecord(record)}>Delete</a>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table<ConversationRecord>
        rowKey="uuid"
        columns={columns}
        expandable={{ expandedRowRender }}
        dataSource={records}
        bordered
        footer={() => ""}
      />
    </>
  );
};

export default ConversationTable;
