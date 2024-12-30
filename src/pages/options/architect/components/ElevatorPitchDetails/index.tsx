import React, { useState } from "react";
import { Button, Form, Input, Layout, message, Modal } from "antd";

import "./index.css";
import intl from "react-intl-universal";
import ElevatorPitchContext, {
  ElevatorPitchRecord,
} from "@pages/options/architect/context/ElevatorPitchContext";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";

const { TextArea } = Input;
const rehypePlugins = [rehypeKatex];
const remarkPlugins = [remarkGfm];

interface ElevatorPitchDetailsProps {
  context: ElevatorPitchContext;
  onElevatorPitchChanged: () => void;
}

const ElevatorPitchDetails: React.FC<ElevatorPitchDetailsProps> = ({
  context,
  onElevatorPitchChanged,
}) => {
  const [details, setDetails] = useState<string>(
    context.getElevatorPitch().details,
  );
  const [boardUrl, setBoardUrl] = useState<string>(
    context.getElevatorPitch().boardUrl,
  );
  const [feedback, setFeedback] = useState<string>(
    context.getElevatorPitch().feedback,
  );
  const [generatedElevatorPitch, setGeneratedElevatorPitch] = useState<string>(
    context.getElevatorPitch().generatedElevatorPitch,
  );
  const [modal, contextHolder] = Modal.useModal();

  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 24 },
  };

  function parseGeneratedElevatorPitch() {
    try {
      const record = JSON.parse(generatedElevatorPitch) as ElevatorPitchRecord;
      context.updateElevatorPitch(record);
    } catch (e) {
      modal.error({
        title: intl.get("elevator_pitch_json_error").d("JSON Error"),
        content: intl
          .get("elevator_pitch_json_error_message")
          .d("Cannot parse JSON, please regenerate."),
      });
    }
  }

  const handleSave = async () => {
    await context.saveElevatorPitch(
      details,
      boardUrl,
      feedback,
      generatedElevatorPitch,
    );
  };

  const handleUpdate = async () => {
    // Parse elevator pitch to json object, and then update the elevator pitch on screen
    if (generatedElevatorPitch) {
      parseGeneratedElevatorPitch();
      onElevatorPitchChanged();
    }
  };

  const handleSubmit = async () => {
    if (!details) {
      message.error(
        intl
          .get("elevator_pitch_err_details_are_empty")
          .d("Details cannot be empty!"),
      );
      return;
    }
    const userInput = "please generate elevator pitch.";
    const props = {
      productDetails: details,
      boardUrl,
      feedback: feedback,
      userInput: userInput,
    };
    // Add logic to handle the submitted pitch
    const elevatorPitchAgent = context.getElevatorPitchAgent();
    elevatorPitchAgent.onReceiveStreamMessage((msg) => {
      setGeneratedElevatorPitch(msg);
    });
    const result = await elevatorPitchAgent.elevatorPitch(props);
    const msg = await elevatorPitchAgent.onCompleted(result);
    setGeneratedElevatorPitch(msg);
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
        <Form.Item label={intl.get("elevator_pitch_feedback").d("Instruct")}>
          <TextArea
            rows={1}
            autoSize={{ minRows: 1, maxRows: 2 }}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={intl
              .get("elevator_pitch_feedback_placeholder")
              .d("provide instruction, feedback or suggestion")}
          />
        </Form.Item>
      </Form>
      <div className={"form-submit-buttons"}>
        <Button type="primary" onClick={handleSubmit}>
          {intl.get("elevator_pitch_submit").d("Submit")}
        </Button>
        <Button type="default" onClick={handleUpdate}>
          {intl.get("elevator_pitch_update").d("Update")}
        </Button>
        <Button type="default" onClick={handleSave}>
          {intl.get("elevator_pitch_save").d("Save")}
        </Button>
      </div>
      <div className={"generated-elevator-pitch"}>
        <ReactMarkdown
          rehypePlugins={rehypePlugins as any}
          remarkPlugins={remarkPlugins as any}
        >{`\`\`\`json\n${generatedElevatorPitch}\`\`\``}</ReactMarkdown>
      </div>
      {contextHolder}
    </Layout>
  );
};

export default ElevatorPitchDetails;