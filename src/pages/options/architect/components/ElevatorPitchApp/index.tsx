import React, { useEffect, useRef, useState } from "react";
import { Layout } from "antd";
import "./index.css";
import ElevatorPitchContext from "@pages/options/architect/context/ElevatorPitchContext";
import ElevatorPitchEditor from "@pages/options/architect/components/ElevatorPitchEditor";
import ElevatorPitchDetails from "@pages/options/architect/components/ElevatorPitchDetails";
import type { GluonConfigure } from "@src/shared/storages/gluonConfig";

interface ElevatorPitchProps {
  config: GluonConfigure;
}

const ElevatorPitchApp: React.FC<ElevatorPitchProps> = ({ config }) => {
  const [loading, setLoading] = useState(true);
  const [context, setContext] = useState(new ElevatorPitchContext(config));

  useEffect(() => {
    context.load().then(() => {
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Layout style={{ padding: "24px" }} className={"elevator-pitch-app"}>
      <ElevatorPitchEditor context={context}></ElevatorPitchEditor>
      <ElevatorPitchDetails context={context}></ElevatorPitchDetails>
      <Layout style={{ flex: "1" }}></Layout>
    </Layout>
  );
};

export default ElevatorPitchApp;
