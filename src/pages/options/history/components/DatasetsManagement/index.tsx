import React from "react";
import { Layout } from "antd";

import "./index.css";
import { GluonConfigure } from "@src/shared/storages/gluonConfig";

interface DatasetsManagementProps {
  config: GluonConfigure;
}

const DatasetsManagement: React.FC<DatasetsManagementProps> = ({ config }) => {
  return (
    <Layout className={"more-coming-soon"}>
      <div className={"more-coming-soon-icon-area"}>
        <div className={"more-coming-soon-logo"}>
          <img src={"/icons/gm_logo.svg"} />
          <h6>Datasets Mgmt. is Coming</h6>
        </div>
      </div>
      <div className={"more-coming-soon-list"}>
        <a>Bad cases</a>
        <a>Intent Recognition dataset</a>
        <a>Summarization dataset</a>
        <a>Planning dataset</a>
        <a>...</a>
      </div>
    </Layout>
  );
};

export default DatasetsManagement;
