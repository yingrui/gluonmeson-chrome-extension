declare interface ChatMessage {
  role: "assistant" | "user" | "system";
  content: string;
}

declare interface ChatSession {
  id: string;
  lastActive: number;
  messages: ChatMessage[];
}

/**
 * https://github.com/openai/openai-node/blob/master/src/resources/chat/completions.ts
 * namespace ChatCompletion {
 *   interface Choice
 * }
 */
declare interface Choice {
  finish_reason:
    | "stop"
    | "length"
    | "tool_calls"
    | "content_filter"
    | "function_call";
  index: number;
  logprobs: Logprobs | null;
  message: ChatCompletionMessage;
}

/**
 * https://github.com/openai/openai-node/blob/master/src/resources/chat/completions.ts
 * interface ChatCompletionMessage
 */
declare interface ChatCompletionMessage {
  content: string | null;
  role: "assistant";
  function_call?: FunctionCall;
  tool_calls?: Array<ToolCall>;
}

/**
 * https://github.com/openai/openai-node/blob/master/src/resources/chat/completions.ts
 * interface ChatCompletionMessageToolCall
 */
declare interface ToolCall {
  id: string;
  function: FunctionCall;
  type: "function";
}

/**
 * https://github.com/openai/openai-node/blob/master/src/resources/chat/completions.ts
 * namespace ChatCompletionMessage {
 *   interface FunctionCall
 * }
 */
declare interface FunctionCall {
  name: string;
  arguments: string;
}

/**
 * https://github.com/openai/openai-node/blob/master/src/resources/chat/completions.ts
 * namespace Choice {
 *   interface Logprobs
 * }
 */
declare interface Logprobs {
  content: Array<ChatCompletionTokenLogprob> | null;
}

/**
 * https://github.com/openai/openai-node/blob/master/src/resources/chat/completions.ts
 * interface ChatCompletionTokenLogprob
 */
declare interface ChatCompletionTokenLogprob {
  token: string;
  bytes: Array<number> | null;
  logprob: number;
  top_logprobs: Array<TopLogprob>;
}

/**
 * https://github.com/openai/openai-node/blob/master/src/resources/chat/completions.ts
 * namespace ChatCompletionTokenLogprob {
 *   interface TopLogprob
 * }
 */
declare interface TopLogprob {
  token: string;
  bytes: Array<number> | null;
  logprob: number;
}
