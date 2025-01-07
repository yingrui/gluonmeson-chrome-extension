import OpenAI from "openai";
import ThoughtAgent, {
  ThoughtAgentProps,
} from "@src/shared/agents/ThoughtAgent";
import Conversation from "@src/shared/agents/core/Conversation";
import Agent from "@src/shared/agents/core/Agent";
import ConversationRepository from "@src/shared/agents/ConversationRepository";
import intl from "react-intl-universal";
import ChatMessage from "@src/shared/agents/core/ChatMessage";
import { locale } from "@src/shared/utils/i18n";
import type { GluonConfigure } from "@src/shared/storages/gluonConfig";
import type { ModelProvider } from "@src/shared/agents/services/ModelService";
import ModelService from "@src/shared/agents/services/ModelService";
import DefaultModelService from "@src/shared/agents/services/DefaultModelService";
import GPTModelService from "@src/shared/agents/services/GPTModelService";
import ReflectionService from "@src/shared/agents/services/ReflectionService";
import PromptReflectionService from "@src/shared/agents/services/PromptReflectionService";
import DelegateAgent from "@src/shared/agents/DelegateAgent";

class BaseAgentFactory {
  private repository: ConversationRepository;
  private initMessages: ChatMessage[];

  thoughtAgentProps(config: GluonConfigure): ThoughtAgentProps {
    const modelService = this.createModelService(config);
    const language = intl.get(locale(config.language)).d("English");
    const reflectionService = config.enableReflection
      ? this.createReflectionService(modelService, language)
      : null;
    return {
      language: language,
      conversation: new Conversation(),
      enableMultimodal: config.enableMultimodal ?? false,
      enableReflection: config.enableReflection ?? false,
      modelService: modelService,
      reflectionService: reflectionService,
    };
  }

  private createModelService(config: GluonConfigure) {
    const client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      organization: config.organization,
      dangerouslyAllowBrowser: true,
    });

    const modelName: string = config.defaultModel ?? "glm-4-plus";
    const toolsCallModel: string = config.toolsCallModel ?? null;
    const multimodalModel: string = config.multimodalModel ?? null;

    if (this.getModelProvider(config.baseURL) === "openai.com") {
      return new GPTModelService({
        client,
        modelName,
        toolsCallModel,
        multimodalModel,
      });
    }

    return new DefaultModelService({
      client,
      modelName,
      toolsCallModel,
      multimodalModel,
    });
  }

  postCreateAgent(agent: Agent): Agent {
    if (this.initMessages && this.initMessages.length > 0) {
      agent.getConversation().set(this.initMessages);
    }

    if (
      this.repository &&
      (agent instanceof DelegateAgent || agent instanceof ThoughtAgent)
    ) {
      agent.setConversationRepository(this.repository);
    }
    return agent;
  }

  public setConversationRepository(repository: ConversationRepository) {
    this.repository = repository;
  }

  public setInitMessages(initMessages: ChatMessage[]) {
    this.initMessages = initMessages;
  }

  private getModelProvider(baseURL: string): ModelProvider {
    if (baseURL.startsWith("https://api.openai.com/v1")) {
      return "openai.com";
    } else if (baseURL.startsWith("https://open.bigmodel.cn/api/paas/v4")) {
      return "zhipu.ai";
    }
    return "custom";
  }

  private createReflectionService(
    modelService: ModelService,
    language: string,
  ): ReflectionService {
    return new PromptReflectionService(modelService, language);
  }
}

export default BaseAgentFactory;
