import React, { useState } from "react";
import { Button, Form, Input, Layout } from "antd";

import "./index.css";
import intl from "react-intl-universal";
import type { ElevatorPitchFramework } from "@pages/options/architect/context/ArchitectContext";
import ArchitectContext from "@pages/options/architect/context/ArchitectContext";

const { TextArea } = Input;

interface ElevatorPitchProductDetailsProps {
  context: ArchitectContext;
}

const ElevatorPitchProductDetails: React.FC<
  ElevatorPitchProductDetailsProps
> = ({ context }) => {
  const [details, setDetails] = useState<string>("");
  const [boardUrl, setBoardUrl] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");

  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 24 },
  };

  const handleSubmit = () => {
    console.log("Elevator Pitch prompt:", details);
    // Add logic to handle the submitted pitch
  };

  return (
    <Layout className={"elevator-pitch-product-details"}>
      <h2>
        {intl
          .get("elevator_pitch_product_details_form")
          .d("Provide details for AI")}
      </h2>

      <Form layout={"vertical"} {...formItemLayout}>
        <Form.Item label={intl.get("elevator_pitch_details").d("Details")}>
          <TextArea
            rows={12}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder={intl
              .get("elevator_pitch_details_placeholder")
              .d("product details")}
          />
        </Form.Item>
        <Form.Item label={intl.get("elevator_pitch_board_url").d("Board URL")}>
          <TextArea
            rows={1}
            autoSize={{ minRows: 1, maxRows: 3 }}
            value={boardUrl}
            onChange={(e) => setBoardUrl(e.target.value)}
            placeholder={intl
              .get("elevator_pitch_board_url_placeholder")
              .d("provide board url")}
          />
        </Form.Item>
        <Form.Item label={intl.get("elevator_pitch_feedback").d("Feedback")}>
          <TextArea
            rows={1}
            autoSize={{ minRows: 1, maxRows: 2 }}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={intl
              .get("elevator_pitch_feedback_placeholder")
              .d("feedback")}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary">
            {intl.get("elevator_pitch_submit").d("Submit")}
          </Button>
        </Form.Item>
      </Form>
    </Layout>
  );
};

export default ElevatorPitchProductDetails;
