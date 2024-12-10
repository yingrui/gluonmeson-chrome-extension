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
import LocalConversationRepository from "@src/shared/repositories/LocalConversationRepository";
import intl from "react-intl-universal";

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
    const language = intl.get(config.language).d("English");
    const enableReflection = config.enableReflection ?? false;
    const enableMultiModal = config.enableMultiModal ?? false;
    const repository = new LocalConversationRepository();

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
      intl.get("agent_description_guru").d("Guru, your browser assistant"),
      enableMultiModal,
      conversation,
      agents,
    );

    const commands = [
      { value: "summary", label: intl.get("command_summary").d("/summary") },
      { value: "search", label: intl.get("command_search").d("/search") },
      { value: "tasking", label: intl.get("command_tasking").d("/tasking") },
      { value: "ui_test", label: intl.get("command_ui_test").d("/ui_test") },
      {
        value: "user_story",
        label: intl.get("command_user_story").d("/user_story"),
      },
    ];
    const delegateAgent = new DelegateAgent(
      agent,
      agents,
      commands,
      conversation,
    );
    delegateAgent.getConversation().set(initMessages);
    delegateAgent.setConversationRepository(repository);
    return delegateAgent;
  }
}

export default AgentFactory;
