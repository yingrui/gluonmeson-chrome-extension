import ChatMessage from "./core/ChatMessage";
import ThinkResult from "./core/ThinkResult";
import OpenAI from "openai";

interface ModelService {
  /**
   * Model name
   */
  modelName: string;

  /**
   * Tools call model
   */
  toolsCallModel: string;

  /**
   * Model providers
   */
  modelProviders: string[];

  /**
   * Supported models
   */
  supportedModels: string[];

  /**
   * Decide if it is multimodal model
   * @param {string} modelName - model name
   * @returns {bool} is multimodal model
   */
  isMultimodalModel(modelName: string): boolean;

  /**
   * Chat completion
   * @param {ChatMessage[]} messages - Messages
   * @param {bool} stream - Stream
   * @returns {Promise<ThinkResult>} ThinkResult
   */
  chatCompletion(
    messages: ChatMessage[],
    stream: boolean,
    useMultimodal: boolean,
  ): Promise<ThinkResult>;

  /**
   * Tools call
   * @param {ChatMessage[]} messages - Messages
   * @param {OpenAI.Chat.Completions.ChatCompletionTool[]} tools - Tools
   * @param {bool} stream - Stream
   * @returns {Promise<ThinkResult>} ThinkResult
   */
  toolsCall(
    messages: ChatMessage[],
    tools: OpenAI.Chat.Completions.ChatCompletionTool[],
    stream: boolean,
  ): Promise<ThinkResult>;
}

export default ModelService;
