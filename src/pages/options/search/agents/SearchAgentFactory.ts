import SearchAgent from "./SearchAgent";
import BaseAgentFactory from "@src/shared/configurers/BaseAgentFactory";
import type { GluonConfigure } from "@src/shared/storages/gluonConfig";

class SearchAgentFactory extends BaseAgentFactory {
  create(config: GluonConfigure): SearchAgent {
    return new SearchAgent(this.thoughtAgentProps(config));
  }
}

export default SearchAgentFactory;
