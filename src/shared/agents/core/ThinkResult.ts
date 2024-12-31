declare type ThinkResultType = "actions" | "message" | "stream" | "error";

declare interface ThinkResultProps {
  type: ThinkResultType;
  actions?: Action[];
  stream?: any;
  firstChunk?: any;
  message?: string;
  error?: Error;
}

class ThinkResult {
  public readonly type: ThinkResultType;
  public readonly actions?: Action[];
  public readonly stream?: any;
  public readonly firstChunk?: any;
  public readonly message?: string;
  public readonly error?: Error;

  constructor(props: ThinkResultProps) {
    const { type, actions, stream, firstChunk, message, error } = props;
    this.type = type;
    this.actions = actions;
    this.stream = stream;
    this.firstChunk = firstChunk;
    this.message = message;
    this.error = error;
  }
}

export default ThinkResult;
