import OpenAI from "openai";
import ThoughtAgent, {
  ThoughtAgentProps,
} from "@src/shared/agents/ThoughtAgent";
import DelegateAgent from "@src/shared/agents/DelegateAgent";
import GluonMesonAgent from "./GluonMesonAgent";
import BACopilotAgent from "./BACopilotAgent";
import TranslateAgent from "./TranslateAgent";
import UiTestAgent from "./UiTestAgent";
import GoogleAgent from "./GoogleAgent";
import Conversation from "@src/shared/agents/core/Conversation";
import Agent from "@src/shared/agents/core/Agent";
import LocalConversationRepository from "@src/shared/repositories/LocalConversationRepository";
import intl from "react-intl-universal";
import ChatMessage from "@src/shared/agents/core/ChatMessage";
import { locale } from "@src/shared/utils/i18n";

class AgentFactory {
  static createGluonMesonAgent(
    config: any,
    initMessages: ChatMessage[],
  ): Agent {
    const baCopilotKnowledgeApi = config.baCopilotKnowledgeApi ?? "";
    const baCopilotTechDescription = config.baCopilotTechDescription ?? "";
    const baCopilotApi = config.baCopilotApi ?? "";
    const apiKey = config.apiKey ?? "";

    const repository = new LocalConversationRepository();

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

    const agents: ThoughtAgent[] = [
      new GoogleAgent(props),
      new TranslateAgent(props),
      new UiTestAgent(props),
      new BACopilotAgent(
        props,
        baCopilotKnowledgeApi,
        baCopilotApi,
        baCopilotTechDescription,
        apiKey,
      ),
    ];

    const agent = new GluonMesonAgent(
      props,
      "Guru",
      intl.get("agent_description_guru").d("Guru, your browser assistant"),
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
      props.conversation,
    );
    delegateAgent.getConversation().set(initMessages);
    delegateAgent.setConversationRepository(repository);
    return delegateAgent;
  }
}

export default AgentFactory;
