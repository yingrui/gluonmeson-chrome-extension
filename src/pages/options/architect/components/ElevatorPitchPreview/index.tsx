import React, { useState } from "react";
import { Button, Card, Form, Input, Layout } from "antd";

import "./index.css";
import intl from "react-intl-universal";
import ElevatorPitchContext from "@pages/options/architect/context/ElevatorPitchContext";
import type { ElevatorPitchRecord } from "@pages/options/architect/entities/ElevatorPitchRecord";

const { TextArea } = Input;

interface ElevatorPitchPreviewProps {
  context: ElevatorPitchContext;
  onEdit: () => void;
}

const ElevatorPitchPreview: React.FC<ElevatorPitchPreviewProps> = ({
  context,
  onEdit,
}) => {
  const elevatorPitch = context.getElevatorPitchRecord();
  console.log("Elevator Pitch Editor Rendering1:", elevatorPitch);
  console.log(
    "Elevator Pitch Editor Rendering2:",
    context.getElevatorPitchRecord(),
  );

  const formItemLayout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 24 },
  };

  return (
    <Layout className={"elevator-pitch-preview"}>
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
            disabled
            placeholder={intl
              .get("elevator_pitch_customer_placeholder")
              .d("target customer")}
          />
        </Form.Item>
        <Form.Item label={intl.get("elevator_pitch_problem").d("WHO")}>
          <TextArea
            rows={2}
            value={elevatorPitch?.problem}
            disabled
            placeholder={intl
              .get("elevator_pitch_problem_placeholder")
              .d("statement of the need or opportunity")}
          />
        </Form.Item>
        <Form.Item label={intl.get("elevator_pitch_product").d("THE")}>
          <TextArea
            rows={2}
            value={elevatorPitch?.productName}
            disabled
            placeholder={intl
              .get("elevator_pitch_product_placeholder")
              .d("product name")}
          />
        </Form.Item>
        <Form.Item label={intl.get("elevator_pitch_product_type").d("IS A")}>
          <TextArea
            rows={2}
            value={elevatorPitch?.productType}
            disabled
            placeholder={intl
              .get("elevator_pitch_product_type_placeholder")
              .d("product type")}
          />
        </Form.Item>
        <Form.Item label={intl.get("elevator_pitch_functionality").d("THAT")}>
          <TextArea
            rows={2}
            value={elevatorPitch?.functionality}
            disabled
            placeholder={intl
              .get("elevator_pitch_functionality_placeholder")
              .d("key benefit, compelling reason to use")}
          />
        </Form.Item>
        <Form.Item label={intl.get("elevator_pitch_competitors").d("UNLIKE")}>
          <TextArea
            rows={2}
            value={elevatorPitch?.competitors}
            disabled
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
            disabled
            placeholder={intl
              .get("elevator_pitch_differentiation_placeholder")
              .d("statement of primary differentiation")}
          />
        </Form.Item>
      </Form>
      <div className={"form-submit-buttons"}>
        <Button type="primary" onClick={onEdit}>
          {intl.get("edit").d("Edit")}
        </Button>
      </div>
    </Layout>
  );
};

export default ElevatorPitchPreview;
