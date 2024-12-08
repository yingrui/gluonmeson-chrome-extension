import { Button, Form, Input, Switch, Modal, Tabs, Select } from "antd";
import { isEqual } from "lodash";
import withSuspense from "@src/shared/hoc/withSuspense";
import withErrorBoundary from "@src/shared/hoc/withErrorBoundary";
import configureStorage, {
  DEFAULT_GM_CONFIG_VALUE,
} from "@root/src/shared/storages/gluonConfig";
import useStorage from "@root/src/shared/hooks/useStorage";
import intl from "react-intl-universal";

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const Popup = () => {
  const [modal, contextHolder] = Modal.useModal();
  const initData = useStorage(configureStorage);
  const [form] = Form.useForm();
  const locale = initData.language === "en" ? "en" : "zh";

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

  async function open_options_page() {
    chrome.runtime.openOptionsPage();
  }

  const tabItems = [
    {
      label: intl.get("basic").d("Basic"),
      key: `basic`,
      forceRender: true,
      children: (
        <>
          <Form.Item
            name="apiKey"
            label={intl.get("apiKey").d("API Key")}
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
            label={intl.get("baseURL").d("Base URL")}
            rules={[
              {
                required: true,
              },
              { type: "url" },
            ]}
          >
            <Input placeholder="https://api.openai.com/v1" />
          </Form.Item>
          <Form.Item
            name="organization"
            label={intl.get("organization").d("Organization")}
          >
            <Input placeholder="your team or your personal information" />
          </Form.Item>
          <Form.Item
            name="defaultModel"
            label={intl.get("defaultModel").d("GPT Model")}
          >
            <Input placeholder="please specify gpt model, eg. gpt-3.5-turbo" />
          </Form.Item>
          <Form.Item
            name="toolsCallModel"
            label={intl.get("toolsCallModel").d("Tools Call Model")}
          >
            <Input placeholder="please specify tools call model, eg. gpt-4-turbo" />
          </Form.Item>
          <Form.Item name="language" label={intl.get("language").d("Language")}>
            <Select
              defaultValue={locale}
              options={[
                { value: "zh", label: intl.get("zh").d("Chinese") },
                { value: "en", label: intl.get("en").d("English") },
              ]}
            />
          </Form.Item>
        </>
      ),
    },
    {
      label: intl.get("ba_copilot").d("BA Copilot"),
      key: `ba_copilot`,
      forceRender: true,
      children: (
        <>
          <Form.Item
            name="baCopilotKnowledgeApi"
            label={intl.get("baCopilotKnowledgeApi").d("Knowledge Api")}
            rules={[{ type: "url" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="baCopilotApi"
            label={intl.get("baCopilotApi").d("Copilot Api")}
            rules={[{ type: "url" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="baCopilotTechDescription"
            label={intl
              .get("baCopilotTechDescription")
              .d("Technical Description")}
          >
            <Input.TextArea style={{ height: 120 }} />
          </Form.Item>
        </>
      ),
    },
    {
      label: intl.get("feature_toggles").d("Features"),
      key: `feature_toggles`,
      forceRender: true,
      children: (
        <>
          <Form.Item
            label={intl.get("enableFloatingBall").d("Floating Ball")}
            name="enableFloatingBall"
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
            {intl.get("save").d("Save")}
          </Button>
          <Button key="cancel" htmlType="button" onClick={reset}>
            {intl.get("reset").d("Reset")}
          </Button>
          <Button
            key="open_side_panel"
            htmlType="button"
            onClick={open_side_panel}
            data-toggle="tooltip"
            data-placement="top"
            title={intl
              .get("tooltip_side_panel")
              .d("Type Alt + Enter can also open side panel")}
          >
            {intl.get("open_side_panel").d("Side Panel")}
          </Button>
          <Button key="options" htmlType="button" onClick={open_options_page}>
            {intl.get("open_more_tools").d("More Tools")}
          </Button>
        </div>
        <p style={{ textAlign: "center" }}>
          <a href="https://github.com/yingrui/gluonmeson-chrome-extension">
            {intl.get("assistant_name").d("Guru Mason")}
          </a>{" "}
          {intl
            .get("tooltip_assistant_shortcut")
            .d(
              "is glad to help you, type `Alt + Enter` can also open side panel.",
            )}
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
