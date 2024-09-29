import GluonConfigure from "@src/shared/storages/gluonConfig";

const mdMermaid = `The following are some examples of the diagrams, charts and graphs that can be made using Mermaid and the Markdown-inspired text specific to it.

\`\`\`mermaid
graph TD
A[Hard] -->|Text| B(Round)
B --> C{Decision}
C -->|One| D[Result 1]
C -->|Two| E[Result 2]
\`\`\`

\`\`\`mermaid
sequenceDiagram
Alice->>John: Hello John, how are you?
loop Healthcheck
    John->>John: Fight against hypochondria
end
Note right of John: Rational thoughts!
John-->>Alice: Great!
John->>Bob: How about you?
Bob-->>John: Jolly good!
\`\`\`
`;

class WriterContext {
  title: string = "";
  content: string = mdMermaid;
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

  public getInitialMessages(): ChatMessage[] {
    const messages = [
      {
        role: "system",
        content: this.getInitialSystemMessage(),
      },
      { role: "assistant", content: "Ask me anything about writing!" },
    ] as ChatMessage[];
    return messages;
  }

  private getInitialSystemMessage(): string {
    return `As an assistant named Guru Mason. You can help users writing with given information.`;
  }
}

export default WriterContext;
