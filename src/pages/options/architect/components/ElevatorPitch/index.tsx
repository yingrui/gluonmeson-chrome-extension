import React from "react";
import { Layout } from "antd";
import "./index.css";
import ArchitectContext from "@pages/options/architect/context/ArchitectContext";
import ElevatorPitchEditor from "@pages/options/architect/components/ElevatorPitchEditor";
import ElevatorPitchProductDetails from "@pages/options/architect/components/ElevatorPitchProductDetails";

interface ElevatorPitchProps {
  context: ArchitectContext;
}

const ElevatorPitch: React.FC<ElevatorPitchProps> = ({ context }) => {
  return (
    <Layout style={{ padding: "24px" }} className={"elevator-pitch-app"}>
      <ElevatorPitchEditor context={context}></ElevatorPitchEditor>
      <ElevatorPitchProductDetails
        context={context}
      ></ElevatorPitchProductDetails>
      <Layout style={{ flex: "1" }}></Layout>
    </Layout>
  );
};

export default ElevatorPitch;
