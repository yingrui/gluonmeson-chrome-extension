import WriterContext from "@src/pages/options/writer/context/WriterContext";
import WriterAgent from "./WriterAgent";
import BaseAgentFactory from "@src/shared/configurers/BaseAgentFactory";
import type { GluonConfigure } from "@src/shared/storages/gluonConfig";

class WriterAgentFactory extends BaseAgentFactory {
  create(config: GluonConfigure, context: WriterContext): WriterAgent {
    return new WriterAgent(this.thoughtAgentProps(config), context);
  }
}

export default WriterAgentFactory;
