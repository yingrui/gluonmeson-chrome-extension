import OpenAI from "openai";
import ThoughtAgent from "@src/shared/agents/ThoughtAgent";
import DelegateAgent from "@src/shared/agents/DelegateAgent";
import GluonMesonAgent from "./GluonMesonAgent";
import BACopilotAgent from "./BACopilotAgent";
import TranslateAgent from "./TranslateAgent";
import UiTestAgent from "./UiTestAgent";
import GoogleAgent from "./GoogleAgent";
import Conversation from "@src/shared/agents/Conversation";
import Agent from "@src/shared/agents/Agent";

class AgentFactory {
  static createGluonMesonAgent(
    config: any,
    initMessages: ChatMessage[],
  ): Agent {
    const defaultModel = config.defaultModel ?? "gpt-3.5-turbo";
    const toolsCallModel = config.toolsCallModel ?? null;
    const baCopilotKnowledgeApi = config.baCopilotKnowledgeApi ?? "";
    const baCopilotTechDescription = config.baCopilotTechDescription ?? "";
    const baCopilotApi = config.baCopilotApi ?? "";
    const apiKey = config.apiKey ?? "";
    const language = config.language ?? "English";
    const enableReflection = config.enableReflection ?? false;

    const client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      organization: config.organization,
      dangerouslyAllowBrowser: true,
    });

    const conversation = new Conversation();

    const agents: ThoughtAgent[] = [
      new GoogleAgent(
        defaultModel,
        toolsCallModel,
        client,
        language,
        conversation,
      ),
      new TranslateAgent(
        defaultModel,
        toolsCallModel,
        client,
        language,
        conversation,
      ),
      new UiTestAgent(
        defaultModel,
        toolsCallModel,
        client,
        language,
        conversation,
      ),
      new BACopilotAgent(
        defaultModel,
        toolsCallModel,
        client,
        language,
        baCopilotKnowledgeApi,
        baCopilotApi,
        baCopilotTechDescription,
        apiKey,
        conversation,
      ),
    ];

    const agent = new GluonMesonAgent(
      defaultModel,
      toolsCallModel,
      client,
      language,
      "Guru",
      "Guru, your browser assistant",
      conversation,
      agents,
    );
    const commands = [
      { value: "summary", label: "/summary" },
      { value: "search", label: "/search" },
      { value: "tasking", label: "/tasking" },
      { value: "ui_test", label: "/ui_test" },
      { value: "user_story", label: "/user_story" },
    ];
    const delegateAgent = new DelegateAgent(
      agent,
      agents,
      commands,
      conversation,
    );
    delegateAgent.getConversation().set(initMessages);
    return delegateAgent;
  }
}

export default AgentFactory;
