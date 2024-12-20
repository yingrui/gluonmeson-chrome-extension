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
  multimodalModel: string;
  baCopilotKnowledgeApi: string;
  baCopilotApi: string;
  baCopilotTechDescription: string;
  language: string;
  enableFloatingBall: boolean;
  enableReflection: boolean;
  enableWriting: boolean;
  enableHistoryRecording: boolean;
  enableMultimodal: boolean;
};

type ConfigureStorage = BaseStorage<GluonConfigure>;

export const DEFAULT_GM_CONFIG_VALUE = {
  apiKey: "",
  baseURL: "",
  organization: "",
  defaultModel: "glm-4-plus",
  toolsCallModel: "glm-4-plus",
  multimodalModel: "glm-4v-plus",
  baCopilotKnowledgeApi: "",
  baCopilotApi: "",
  baCopilotTechDescription: "",
  language: "English",
  enableFloatingBall: true,
  enableReflection: false,
  enableWriting: false,
  enableHistoryRecording: false,
  enableMultimodal: false,
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
