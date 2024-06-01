import { Button, Form, Input, Switch, Modal, Tabs } from "antd";
import { isEqual } from "lodash";
import withSuspense from "@src/shared/hoc/withSuspense";
import withErrorBoundary from "@src/shared/hoc/withErrorBoundary";
import configureStorage, {
  DEFAULT_GM_CONFIG_VALUE,
} from "@root/src/shared/storages/gluonConfig";
import useStorage from "@root/src/shared/hooks/useStorage";

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const Popup = () => {
  const [modal, contextHolder] = Modal.useModal();
  const initData = useStorage(configureStorage);
  const [form] = Form.useForm();

  const onSaveSettings = async () => {
    const values = await form.validateFields();
    if (!isEqual(values, initData)) {
      modal.confirm({
        title: "Confirm to save configuration",
        async onOk() {
          await configureStorage.set(values);
          window.close();
        },
      });
    }
  };

  async function reset() {
    form.setFieldsValue(DEFAULT_GM_CONFIG_VALUE);
  }

  const tabItems = [
    {
      label: `Basic`,
      key: `basic`,
      children: (
        <>
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
              { type: "url" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="organization" label="Organization">
            <Input />
          </Form.Item>
          <Form.Item name="defaultModel" label="GPT Model">
            <Input placeholder="please specify gpt model, eg. gpt-3.5-turbo" />
          </Form.Item>
          <Form.Item name="toolsCallModel" label="Tools Call Model">
            <Input placeholder="please specify tools call model, eg. gpt-4-turbo" />
          </Form.Item>
          <Form.Item
            label="Floating Ball"
            name="enableFloatingBall"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </>
      ),
    },
    {
      label: `Trello`,
      key: `trello`,
      children: (
        <>
          <Form.Item
            name="trelloSearchApi"
            label="Search Api Url"
            rules={[{ type: "url" }]}
          >
            <Input />
          </Form.Item>
        </>
      ),
    },
  ];

  return (
    <div className="form-container">
      <Form
        initialValues={initData}
        form={form}
        layout="inline"
        {...formItemLayout}
        onFinish={onSaveSettings}
      >
        <Tabs
          style={{ height: "300px" }}
          defaultActiveKey="1"
          type="card"
          size="small"
          items={tabItems}
        />
        <div className="popup-footer">
          <Button key="create" type="primary" htmlType="submit">
            Save
          </Button>
          <Button key="cancel" htmlType="button" onClick={reset}>
            Reset
          </Button>
        </div>
      </Form>
      {contextHolder}
    </div>
  );
};

export default withErrorBoundary(
  withSuspense(Popup, <div> Loading ... </div>),
  <div> Error Occur </div>,
);
