import React from "react";
import { Button, Form, Input, Layout, Switch } from "antd";
import "./index.css";
import { GluonConfigure } from "@src/shared/storages/gluonConfig";
import intl from "react-intl-universal";

interface FeatureTogglesProps {
  config: GluonConfigure;
  onSaveSettings: (values: any) => void;
}

const FeatureToggles: React.FC<FeatureTogglesProps> = ({
  config,
  onSaveSettings,
}) => {
  const [form] = Form.useForm();

  const onSave = async () => {
    onSaveSettings(await form.validateFields());
  };

  return (
    <Layout className={"feature-toggle-app"}>
      <div className={"feature-toggle"}>
        <div className="form-container">
          <Form
            name="feature-toggle"
            labelCol={{ span: 3 }}
            layout="horizontal"
            initialValues={config}
            form={form}
            onFinish={onSave}
            autoComplete="off"
          >
            <Form.Item
              label={intl.get("enableFloatingBall").d("Floating Ball")}
              name="enableFloatingBall"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item
              label={intl.get("enableMultimodal").d("Multimodal")}
              name="enableMultimodal"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item
              label={intl.get("enableReflection").d("Reflection")}
              name="enableReflection"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item
              label={intl.get("enableWriting").d("Writing Tools")}
              name="enableWriting"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item
              label={intl.get("enableHistoryRecording").d("History Records")}
              name="enableHistoryRecording"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item label={null}>
              <Button key="create" type="primary" htmlType="submit">
                {intl.get("save").d("Save")}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </Layout>
  );
};

export default FeatureToggles;
