import type { TreeDataNode } from "antd";

interface TreeNode {
  key: string;
  level: number;
  title: string;
  children: TreeNode[];
  parent: TreeNode | null;
}

class OutlineParser {
  private root: TreeNode;

  constructor() {
    this.resetRoot();
  }

  private resetRoot() {
    this.root = {
      key: "Root",
      level: 0,
      title: "Root",
      children: [],
      parent: null,
    };
  }

  public getTreeDataNode(): TreeDataNode {
    return this.convertToTreeDataNode(this.root);
  }

  public parse(content: string): OutlineParser {
    // Parse the markdown content and generate the outline
    // all the headings are starting with #, ##, ###, ####, #####
    // all the headings are descendent of the root node
    this.resetRoot();
    const lines = content.split("\n");
    let current = this.root;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const level = this.getHeadingLevel(line);
      const title = this.getHeadingTitle(line);
      if (level > 0) {
        const node: TreeNode = {
          key: `heading-${i}`,
          title: title,
          level: level,
          children: [],
          parent: null,
        };
        if (level == current.level) {
          current = current.parent;
        } else if (level < current.level) {
          while (current.level >= level) {
            current = current.parent!;
          }
        }
        // When level > current.level, directly add the node as a child of the current node
        node.parent = current;
        current.children.push(node);
        current = node;
      }
    }
    return this;
  }

  private convertToTreeDataNode(node: TreeNode): TreeDataNode {
    return {
      title: node.title,
      key: node.key,
      children: node.children.map((child) => this.convertToTreeDataNode(child)),
    };
  }

  private getHeadingLevel(line: string) {
    const heading = line.slice(0, line.indexOf(" ")).trim();
    // if all the characters are #, then it is a heading
    if (heading.match(/^#+$/)) {
      return heading.length;
    }
    return -1;
  }

  private getHeadingTitle(line: string) {
    return line.slice(line.indexOf(" ") + 1).trim();
  }
}

export default OutlineParser;
