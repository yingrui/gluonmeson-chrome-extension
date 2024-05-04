import withSuspense from "@src/shared/hoc/withSuspense";
import withErrorBoundary from "@src/shared/hoc/withErrorBoundary";

import { Button, Form, Input, Switch } from "antd";
import { useEffect } from "react";

export const CONFIG_STAORAGE_KEY = "gm_configure_data";

const Popup = () => {
  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  };

  const storage = chrome.storage.local;
  const [form] = Form.useForm();

  useEffect(() => {
    storage.get(CONFIG_STAORAGE_KEY, function (items) {
      loadData(items);
    });
  });

  const onSaveSettings = () => {
    form.validateFields().then(async (values) => {
      // Save settings using Chrome Storage API or handle them as needed
      const configure = { ...values };
      await storage.set(
        { [CONFIG_STAORAGE_KEY]: configure },
        async function () {
          chrome.runtime.sendMessage({
            type: "enable_floating_ball",
            enabled: configure.enableFloatingBall,
          });
          window.close();
        },
      );
    });
  };

  function loadData(items) {
    if (!items) {
      form.resetFields();
      return;
    }
    form.setFieldsValue({
      ...items?.[CONFIG_STAORAGE_KEY],
    });
  }

  async function clear(event) {
    event.preventDefault();
    await storage.set({ [CONFIG_STAORAGE_KEY]: null }, function () {
      loadData(null);
    });
  }

  return (
    <div className="form-container">
      <Form
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
          <Switch defaultValue={true} />
        </Form.Item>
        <div className="popup-footer">
          <Button key="create" type="primary" htmlType="submit">
            Save
          </Button>
          <Button key="cancel" onClick={clear}>
            Clear
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
