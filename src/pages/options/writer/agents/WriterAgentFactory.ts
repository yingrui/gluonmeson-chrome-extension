import WriterContext from "@src/pages/options/writer/context/WriterContext";
import WriterAgent from "./WriterAgent";
import BaseAgentFactory from "@src/shared/configurers/BaseAgentFactory";
import type { GluonConfigure } from "@src/shared/storages/gluonConfig";
import intl from "react-intl-universal";
import ChatMessage from "@src/shared/agents/core/ChatMessage";
import DelegateAgent from "@src/shared/agents/DelegateAgent";

class WriterAgentFactory extends BaseAgentFactory {
  create(
    config: GluonConfigure,
    context: WriterContext,
    initMessages: ChatMessage[],
  ): DelegateAgent {
    const props = this.thoughtAgentProps(config);
    props.enableMultimodal = false;
    props.enableReflection = false;

    const commands = [
      { value: "autocomplete", label: "/autocomplete, continue writing" },
      {
        value: "outline",
        label: intl.get("options_app_writer_command_outline").d("/outline"),
      },
      {
        value: "review",
        label: intl.get("options_app_writer_command_review").d("/review"),
      },
      {
        value: "search",
        label: intl.get("options_app_writer_command_search").d("/search"),
      },
    ];
    this.setInitMessages(initMessages);

    const writerAgent = new WriterAgent(props, context);
    const delegateAgent = new DelegateAgent(
      writerAgent,
      [writerAgent],
      commands,
      props.conversation,
      true, //chitchat when tool not found
    );
    this.postCreateAgent(delegateAgent);
    return delegateAgent;
  }
}

export default WriterAgentFactory;
