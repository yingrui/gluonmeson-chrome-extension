import SensitiveTopicError from "./errors/SensitiveTopicError";

declare type ThoughtType = "actions" | "message" | "stream" | "error";

declare interface ThoughtProps {
  type: ThoughtType;
  actions?: Action[];
  stream?: any;
  message?: string;
  error?: Error;
}

class Thought {
  public readonly type: ThoughtType;
  public readonly actions?: Action[];
  public readonly stream?: AsyncIterator<any>;
  public readonly message?: string;
  public readonly error?: Error;

  constructor(props: ThoughtProps) {
    const { type, actions, stream, message, error } = props;
    this.type = type;
    this.actions = actions;
    this.stream = stream;
    this.message = message;
    this.error = error;
  }

  public async getMessage(
    notifyMessageChanged: (msg: string) => void = undefined,
  ): Promise<string> {
    if (this.type === "stream") {
      return await this.readMessageFromStream(
        this.stream,
        notifyMessageChanged,
      );
    } else if (this.type === "message") {
      return this.message;
    }
    throw new Error("Cannot get message from this thought.");
  }

  private async readMessageFromStream(
    stream: any,
    notifyMessageChanged: (msg: string) => void,
  ): Promise<string> {
    let message = "";
    for await (const chunk of stream) {
      if (chunk.choices) {
        const finishReason = chunk.choices[0]?.finish_reason;
        if (finishReason === "sensitive") {
          throw new SensitiveTopicError();
        }
        const content = chunk.choices[0]?.delta?.content ?? "";
        message = message + content;
      } else {
        // When stream is not from openai chat completion, but an AsyncIterator
        message = message + chunk.data;
      }
      // Notify message changed, for rendering in UI
      if (notifyMessageChanged) {
        notifyMessageChanged(message);
      }
    }
    return message;
  }
}

export default Thought;
