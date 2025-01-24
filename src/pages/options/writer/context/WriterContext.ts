import type { GluonConfigure } from "@src/shared/storages/gluonConfig";
import type { TreeDataNode } from "antd";
import OutlineParser from "./OutlineParser";

type SelectionRange = {
  selectionStart: number;
  selectionEnd: number;
};

class WriterContext {
  private title: string = "";
  private content: string = "";
  private selectionRange: SelectionRange = {
    selectionStart: 0,
    selectionEnd: 0,
  };
  private config: GluonConfigure;
  private outlineChangeListener: (tree: TreeDataNode[]) => void;
  private outline: TreeDataNode[] = [];

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
    if (this.outlineChangeListener) {
      this.outline = new OutlineParser()
        .parse(content)
        .getTreeDataNode().children;
      this.outlineChangeListener(this.outline);
    }
  }

  public setSelectionRange(selectionStart: number, selectionEnd: number) {
    this.selectionRange.selectionStart = selectionStart;
    this.selectionRange.selectionEnd = selectionEnd;
  }

  public getSelectionRange(): SelectionRange {
    return this.selectionRange;
  }

  public onOutlineChange(listener: (tree: TreeDataNode[]) => void) {
    this.outlineChangeListener = listener;
  }
}

export default WriterContext;
export type { SelectionRange };
