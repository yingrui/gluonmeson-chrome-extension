declare type ThoughtType = "actions" | "message" | "stream" | "error";

declare interface ThoughtProps {
  type: ThoughtType;
  actions?: Action[];
  stream?: any;
  firstChunk?: any;
  message?: string;
  error?: Error;
}

class Thought {
  public readonly type: ThoughtType;
  public readonly actions?: Action[];
  public readonly stream?: AsyncIterator<any>;
  public readonly firstChunk?: any;
  public readonly message?: string;
  public readonly error?: Error;

  constructor(props: ThoughtProps) {
    const { type, actions, stream, firstChunk, message, error } = props;
    this.type = type;
    this.actions = actions;
    this.stream = stream;
    this.firstChunk = firstChunk;
    this.message = message;
    this.error = error;
  }
}

export default Thought;
