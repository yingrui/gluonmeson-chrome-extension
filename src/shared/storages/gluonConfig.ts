import {
  BaseStorage,
  createStorage,
  StorageType,
} from "@src/shared/storages/base";

export type GluonConfigure = {
  apiKey: string;
  baseURL: string;
  organization: string;
  defaultModel: string;
  toolsCallModel: string;
  baCopilotKnowledgeApi: string;
  baCopilotApi: string;
  baCopilotTechDescription: string;
  language: string;
  enableFloatingBall: boolean;
  enableReflection: boolean;
  enableWriting: boolean;
};

type ConfigureStorage = BaseStorage<GluonConfigure>;

export const DEFAULT_GM_CONFIG_VALUE = {
  apiKey: "",
  baseURL: "",
  organization: "",
  defaultModel: "gpt-3.5-turbo",
  toolsCallModel: "gpt-4-turbo",
  baCopilotKnowledgeApi: "",
  baCopilotApi: "",
  baCopilotTechDescription: "",
  language: "English",
  enableFloatingBall: true,
  enableReflection: false,
  enableWriting: false,
};

const storage = createStorage<GluonConfigure>(
  "gm_configure_data",
  DEFAULT_GM_CONFIG_VALUE,
  {
    storageType: StorageType.Local,
    liveUpdate: true,
  },
);

const configureStorage: ConfigureStorage = {
  ...storage,
};

export default configureStorage;
