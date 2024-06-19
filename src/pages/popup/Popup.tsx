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

  async function open_side_panel() {
    chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
      chrome.sidePanel.open({ tabId: tabs[0].id });
    });
  }

  const tabItems = [
    {
      label: `Basic`,
      key: `basic`,
      forceRender: true,
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
            <Input placeholder="https://api.openai.com/v1" />
          </Form.Item>
          <Form.Item name="organization" label="Organization">
            <Input placeholder="your team or your personal information" />
          </Form.Item>
          <Form.Item name="defaultModel" label="GPT Model">
            <Input placeholder="please specify gpt model, eg. gpt-3.5-turbo" />
          </Form.Item>
          <Form.Item name="toolsCallModel" label="Tools Call Model">
            <Input placeholder="please specify tools call model, eg. gpt-4-turbo" />
          </Form.Item>
          <Form.Item name="language" label="Language">
            <Input placeholder="please specify prefer language, eg. Chinese or 中文" />
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
      label: `BA Copilot`,
      key: `ba_copilot`,
      forceRender: true,
      children: (
        <>
          <Form.Item
            name="baCopilotKnowledgeApi"
            label="Knowledge Api"
            rules={[{ type: "url" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="baCopilotApi"
            label="Copilot Api"
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
          style={{ height: "340px" }}
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
          <Button
            key="open_side_panel"
            htmlType="button"
            onClick={open_side_panel}
            data-toggle="tooltip"
            data-placement="top"
            title="Type Alt + Enter can also open side panel"
          >
            Open Side Panel
          </Button>
        </div>
        <p style={{ textAlign: "center" }}>
          <a href="https://github.com/yingrui/gluonmeson-chrome-extension">
            Guru Mason
          </a>{" "}
          is glad to help you, type `Alt + Enter` can also open side panel.
        </p>
      </Form>
      {contextHolder}
    </div>
  );
};

export default withErrorBoundary(
  withSuspense(Popup, <div> Loading ... </div>),
  <div> Error Occur </div>,
);
