import {
  BaseStorage,
  createStorage,
  StorageType,
} from "@src/shared/storages/base";

type GluonConfigure = {
  apiKey: string;
  baseURL: string;
  organization: string;
  enableFloatingBall: boolean;
};

type ConfigureStorage = BaseStorage<GluonConfigure>;

export const DEFAULT_GM_CONFIG_VALUE = {
  apiKey: "",
  baseURL: "",
  organization: "",
  enableFloatingBall: true,
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
