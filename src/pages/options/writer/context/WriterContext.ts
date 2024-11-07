import type { GluonConfigure } from "@src/shared/storages/gluonConfig";

class WriterContext {
  title: string = "";
  content: string = "";
  config: GluonConfigure;

  constructor(config: GluonConfigure) {
    this.config = config;
  }

  public getTitle(): string {
    return this.title;
  }

  public setTitle(title: string): void {
    this.title = title;
  }

  public getContent(): string {
    return this.content;
  }

  public setContent(content: string): void {
    this.content = content;
  }
}

export default WriterContext;
