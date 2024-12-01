import React from "react";
import "./index.css";
import { Layout } from "antd";

const MoreComing = () => {
  return (
    <Layout className={"more-coming-soon"}>
      <div className={"more-coming-soon-icon-area"}>
        <div className={"more-coming-soon-logo"}>
          <img src={"/icons/gm_logo.svg"} />
          <h6>More Coming Soon</h6>
        </div>
      </div>
      <div className={"more-coming-soon-list"}>
        <a>Product Elevator Pitch</a>
        <a>Tech Strategy</a>
        <a>Brainstorming</a>
        <a>Writing Tools</a>
        <a>...</a>
      </div>
    </Layout>
  );
};

export default MoreComing;
