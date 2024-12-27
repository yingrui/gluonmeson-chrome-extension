import React, { useState } from "react";
import { Button, Card, Form, Input, Layout } from "antd";

import "./index.css";
import intl from "react-intl-universal";
import ElevatorPitchContext from "@pages/options/architect/context/ElevatorPitchContext";
import type { ElevatorPitchRecord } from "@pages/options/architect/entities/ElevatorPitchRecord";

const { TextArea } = Input;

interface ElevatorPitchEditorProps {
  context: ElevatorPitchContext;
}

const ElevatorPitchEditor: React.FC<ElevatorPitchEditorProps> = ({
  context,
}) => {
  const [elevatorPitch, setElevatorPitch] = useState<ElevatorPitchRecord>(
    context.getElevatorPitchRecord(),
  );

  const formItemLayout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 24 },
  };

  const handleInputChange = (
    field: keyof ElevatorPitchRecord,
    value: string,
  ) => {
    setElevatorPitch({ ...elevatorPitch, [field]: value });
  };

  const handleSubmit = () => {
    console.log("Elevator Pitch Submitted:", elevatorPitch);
    // Add logic to handle the submitted pitch
  };

  return (
    <Layout className={"elevator-pitch-editor"}>
      <h2>
        {intl
          .get("options_app_architect_items_elevator_pitch")
          .d("Elevator Pitch")}
      </h2>

      <Form layout={"vertical"} {...formItemLayout}>
        <Form.Item label={intl.get("elevator_pitch_customer").d("FOR")}>
          <TextArea
            rows={2}
            value={elevatorPitch?.customer}
            onChange={(e) => handleInputChange("customer", e.target.value)}
            placeholder={intl
              .get("elevator_pitch_customer_placeholder")
              .d("target customer")}
          />
        </Form.Item>
        <Form.Item label={intl.get("elevator_pitch_problem").d("WHO")}>
          <TextArea
            rows={2}
            value={elevatorPitch?.problem}
            onChange={(e) => handleInputChange("problem", e.target.value)}
            placeholder={intl
              .get("elevator_pitch_problem_placeholder")
              .d("statement of the need or opportunity")}
          />
        </Form.Item>
        <Form.Item label={intl.get("elevator_pitch_product").d("THE")}>
          <TextArea
            rows={2}
            value={elevatorPitch?.productName}
            onChange={(e) => handleInputChange("productName", e.target.value)}
            placeholder={intl
              .get("elevator_pitch_product_placeholder")
              .d("product name")}
          />
        </Form.Item>
        <Form.Item label={intl.get("elevator_pitch_product_type").d("IS A")}>
          <TextArea
            rows={2}
            value={elevatorPitch?.productType}
            onChange={(e) => handleInputChange("productType", e.target.value)}
            placeholder={intl
              .get("elevator_pitch_product_type_placeholder")
              .d("product type")}
          />
        </Form.Item>
        <Form.Item label={intl.get("elevator_pitch_functionality").d("THAT")}>
          <TextArea
            rows={2}
            value={elevatorPitch?.functionality}
            onChange={(e) => handleInputChange("functionality", e.target.value)}
            placeholder={intl
              .get("elevator_pitch_functionality_placeholder")
              .d("key benefit, compelling reason to use")}
          />
        </Form.Item>
        <Form.Item label={intl.get("elevator_pitch_competitors").d("UNLIKE")}>
          <TextArea
            rows={2}
            value={elevatorPitch?.competitors}
            onChange={(e) => handleInputChange("competitors", e.target.value)}
            placeholder={intl
              .get("elevator_pitch_competitors_placeholder")
              .d("primary competitive alternative")}
          />
        </Form.Item>
        <Form.Item
          label={intl.get("elevator_pitch_differentiation").d("OUR PRODUCT")}
        >
          <TextArea
            rows={2}
            value={elevatorPitch?.differentiation}
            onChange={(e) =>
              handleInputChange("differentiation", e.target.value)
            }
            placeholder={intl
              .get("elevator_pitch_differentiation_placeholder")
              .d("statement of primary differentiation")}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary">
            {intl.get("elevator_pitch_preview").d("Preview")}
          </Button>
        </Form.Item>
      </Form>
    </Layout>
  );
};

export default ElevatorPitchEditor;
