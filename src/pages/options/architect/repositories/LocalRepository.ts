class LocalStorage {
  private storage: chrome.storage.StorageArea;

  constructor() {
    this.storage = chrome.storage.local;
  }

  async put(key: string, value: string): Promise<void> {
    await this.storage.set({ [key]: value });
  }

  async get(key: string, defaultValue: string = null): Promise<string> {
    const value = await this.storage.get([key]);
    const obj = value[key];
    if (obj) {
      return obj;
    }
    return defaultValue;
  }
}

export default LocalStorage;
