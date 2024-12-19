import OpenAI from "openai";
import { ThoughtAgentProps } from "@src/shared/agents/ThoughtAgent";
import Conversation from "@src/shared/agents/core/Conversation";
import Agent from "@src/shared/agents/core/Agent";
import ConversationRepository from "@src/shared/agents/ConversationRepository";
import intl from "react-intl-universal";
import ChatMessage from "@src/shared/agents/core/ChatMessage";
import { locale } from "@src/shared/utils/i18n";
import BaseAgent from "@src/shared/agents/BaseAgent";
import type { GluonConfigure } from "@src/shared/storages/gluonConfig";

class BaseAgentFactory {
  private repository: ConversationRepository;
  private initMessages: ChatMessage[];

  thoughtAgentProps(config: GluonConfigure): ThoughtAgentProps {
    const client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      organization: config.organization,
      dangerouslyAllowBrowser: true,
    });

    const props: ThoughtAgentProps = {
      modelName: config.defaultModel ?? "gpt-3.5-turbo",
      toolsCallModel: config.toolsCallModel ?? null,
      client: client,
      language: intl.get(locale(config.language)).d("English"),
      conversation: new Conversation(),
      enableMultiModal: config.enableMultiModal ?? false,
      enableReflection: config.enableReflection ?? false,
    };

    return props;
  }

  postCreateAgent(agent: Agent): Agent {
    if (this.initMessages && this.initMessages.length > 0) {
      agent.getConversation().set(this.initMessages);
    }

    if (this.repository && agent instanceof BaseAgent) {
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
}

export default BaseAgentFactory;
