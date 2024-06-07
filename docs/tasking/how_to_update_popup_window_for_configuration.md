## How to set up configurations in the extension Popup page

### Step 1: Add tab in Popup page if needed
If we add trello tab in the popup page, we need to add a new tab in `tabItems` in file `src/pages/popup/Popup.tsx`. In this tab, you can add `Form.Item` to set up configurations Web UI.
```typescript
const tabItems = [
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
    }
```

### Step 2: Save configurations on Click `Save` button
In the `src/pages/popup/Popup.tsx` file, we can save configurations in the `onSaveSettings` method. You can change it as needed.
```typescript
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
```

### Step 3: Define configurations
The `configurationStorage` is defined in the `src/shared/storages/gluonConfig.ts` file. Please add new configurations as needed.
```typescript
type GluonConfigure = {
  apiKey: string;
  baseURL: string;
  ...
  trelloSearchApi: string;
  ...
};

export const DEFAULT_GM_CONFIG_VALUE = {
  ...
  trelloSearchApi: "",
  ...
};
```

### Step 4: Load configurations

In the `src/pages/sidepanel/agents/agents.ts` file, we can load configurations from `configureStorage` and use them in the agent.
```typescript
import configureStorage from "@root/src/shared/storages/gluonConfig";

configureStorage.get().then((config) => {
  ...
});
```

