declare interface ThinkResultProps {
  type: "actions" | "message" | "stream";
  actions?: Action[];
  stream?: any;
  firstChunk?: any;
  message?: string;
}

class ThinkResult {
  public readonly type: "actions" | "message" | "stream";
  public readonly actions?: Action[];
  public readonly stream?: any;
  public readonly firstChunk?: any;
  public readonly message?: string;

  constructor(props: ThinkResultProps) {
    const { type, actions, stream, firstChunk, message } = props;
    this.type = type;
    this.actions = actions;
    this.stream = stream;
    this.firstChunk = firstChunk;
    this.message = message;
  }
}

export default ThinkResult;
