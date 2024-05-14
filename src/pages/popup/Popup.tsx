import withSuspense from "@src/shared/hoc/withSuspense";
import withErrorBoundary from "@src/shared/hoc/withErrorBoundary";

import { Button, Form, Input, Switch } from "antd";
import configureStorage, {
  DEFAULT_GM_CONFIG_VALUE,
} from "@root/src/shared/storages/gluonConfig";
import useStorage from "@root/src/shared/hooks/useStorage";

const Popup = () => {
  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  };

  const [form] = Form.useForm();
  const configStorage = useStorage(configureStorage);

  const onSaveSettings = () => {
    form.validateFields().then(async (values) => {
      await configureStorage.set({ ...values });
      window.close();
    });
  };

  async function reset() {
    await configureStorage.set(DEFAULT_GM_CONFIG_VALUE);
    form.resetFields();
  }

  return (
    <div className="form-container">
      <Form
        initialValues={configStorage}
        form={form}
        layout="inline"
        {...formItemLayout}
        onFinish={onSaveSettings}
      >
        <Form.Item
          name="apiKey"
          label="API key"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input type="password" />
        </Form.Item>
        <Form.Item
          name="baseURL"
          label="Base URL"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="organization" label="Organization">
          <Input />
        </Form.Item>
        <Form.Item
          label="Floating Ball"
          name="enableFloatingBall"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        <div className="popup-footer">
          <Button key="create" type="primary" htmlType="submit">
            Save
          </Button>
          <Button key="cancel" htmlType="button" onClick={reset}>
            Reset
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default withErrorBoundary(
  withSuspense(Popup, <div> Loading ... </div>),
  <div> Error Occur </div>,
);
