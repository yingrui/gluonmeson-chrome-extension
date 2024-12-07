import React, { useState } from "react";
import type { TableColumnsType } from "antd";
import { Space, Table, Tag } from "antd";
import {
  LikeOutlined,
  LikeFilled,
  DislikeOutlined,
  DislikeFilled,
} from "@ant-design/icons";
import type { GluonConfigure } from "@src/shared/storages/gluonConfig";
import LocalConversationRepository, {
  ConversationRecord,
  InteractionRecord,
} from "@src/shared/repositories/LocalConversationRepository";
import "./index.css";

interface ConversationTableProps {
  config: GluonConfigure;
}

const ConversationTable: React.FC<ConversationTableProps> = ({ config }) => {
  const [records, setRecords] = useState<ConversationRecord[]>([]);
  const [brief, setBrief] = useState<string>("");
  const repository = new LocalConversationRepository();

  const recordsBrief = (records: ConversationRecord[]) => {
    const interactionsCount = records.reduce(
      (c, r) => c + r.interactions.length,
      0,
    );
    const evaluatedCount = records.reduce(
      (c, r) => c + r.interactions.filter((i) => i.like !== undefined).length,
      0,
    );
    const satisfiedCount = records.reduce(
      (c, r) => c + r.interactions.filter((i) => i.like === true).length,
      0,
    );
    const satisfiedRate =
      evaluatedCount === 0 ? 0 : satisfiedCount / evaluatedCount;
    return `Total ${interactionsCount} interactions, satisfied rate is ${satisfiedRate.toFixed(2)}`;
  };

  const getRecords = async () => {
    if (records.length === 0) {
      const conversationRecords = await repository.findAll();
      setRecords(conversationRecords);
      setBrief(recordsBrief(conversationRecords));
    }
  };
  getRecords();

  const deleteRecord = async (record: ConversationRecord) => {
    await repository.delete(record.key);
    setRecords(await repository.findAll());
  };

  const keepRecord = async (record: ConversationRecord) => {
    record.recordStatus = "Kept";
    await repository.update(record);
    setRecords(await repository.findAll());
  };

  const evaluateInteraction = async (
    interactionRecord: InteractionRecord,
    like: boolean,
  ) => {
    const matchedRecords = records.filter(
      (record) =>
        record.interactions.findIndex(
          (i) => i.uuid === interactionRecord.uuid,
        ) >= 0,
    );
    if (matchedRecords.length > 0) {
      const matchedRecord = matchedRecords[0];
      const matchedInteraction = matchedRecord.interactions.find(
        (i) => i.uuid === interactionRecord.uuid,
      );
      if (matchedInteraction) {
        matchedInteraction.like = like;
        await repository.update(matchedRecord);
        setRecords(await repository.findAll());
      }
    }
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
          {record.recordStatus !== "Kept" && (
            <a onClick={(e) => keepRecord(record)}>Keep</a>
          )}
          <a onClick={(e) => deleteRecord(record)}>Delete</a>
        </Space>
      ),
    },
  ];

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
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          {record.like === undefined && (
            <>
              <a onClick={(e) => evaluateInteraction(record, true)}>
                <LikeOutlined />
              </a>
              <a onClick={(e) => evaluateInteraction(record, false)}>
                <DislikeOutlined />
              </a>
            </>
          )}
          {record.like !== undefined &&
            (record.like ? (
              <a onClick={(e) => evaluateInteraction(record, false)}>
                <LikeFilled />
              </a>
            ) : (
              <a onClick={(e) => evaluateInteraction(record, true)}>
                <DislikeFilled />
              </a>
            ))}
        </Space>
      ),
    },
  ];

  const expandedRowRender = (record: ConversationRecord) => {
    return (
      <Table<InteractionRecord>
        rowKey="uuid"
        columns={interactionColumns}
        dataSource={record.interactions}
        pagination={false}
      />
    );
  };

  return (
    <>
      <Space className={"conversation-records-desc"}>
        <span>{brief}</span>
      </Space>
      <Table<ConversationRecord>
        rowKey="uuid"
        columns={columns}
        expandable={{ expandedRowRender }}
        expandRowByClick
        dataSource={records}
        bordered
        footer={() => `Total ${records.length} records`}
      />
    </>
  );
};

export default ConversationTable;
