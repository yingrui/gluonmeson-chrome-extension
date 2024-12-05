import React from "react";
import type { GluonConfigure } from "@src/shared/storages/gluonConfig";
import "./index.css";
import ConversationTable from "@pages/options/history/components/ConversationTable";

interface HistoryPanelProps {
  config: GluonConfigure;
  historyType: string;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ config, historyType }) => {
  return (
    <div className={"history-table"}>
      {historyType === "Conversations" && (
        <ConversationTable config={config}></ConversationTable>
      )}
    </div>
  );
};

export default HistoryPanel;
