import {
  BaseStorage,
  createStorage,
  StorageType,
} from "@src/shared/storages/base";

type GluonConfigure = {
  apiKey: string;
  baseURL: string;
  organization: string;
};

type ConfigureStorage = BaseStorage<GluonConfigure>;

const storage = createStorage<GluonConfigure>(
  "configure",
  {
    apiKey: "",
    baseURL: "",
    organization: "",
  },
  {
    storageType: StorageType.Local,
    liveUpdate: true,
  },
);

const configureStorage: ConfigureStorage = {
  ...storage,
};

export default configureStorage;
