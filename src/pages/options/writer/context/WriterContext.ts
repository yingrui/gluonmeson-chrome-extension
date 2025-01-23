import type { GluonConfigure } from "@src/shared/storages/gluonConfig";

type SelectionRange = {
  selectionStart: number;
  selectionEnd: number;
};

class WriterContext {
  title: string = "";
  content: string = "";
  selectionRange: SelectionRange = {
    selectionStart: 0,
    selectionEnd: 0,
  };
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

  public setSelectionRange(selectionStart: number, selectionEnd: number) {
    this.selectionRange.selectionStart = selectionStart;
    this.selectionRange.selectionEnd = selectionEnd;
  }

  public getSelectionRange(): SelectionRange {
    return this.selectionRange;
  }
}

export default WriterContext;
export type { SelectionRange };
