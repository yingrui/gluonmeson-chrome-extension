import BaseAgentFactory from "@src/shared/configurers/BaseAgentFactory";
import type { GluonConfigure } from "@src/shared/storages/gluonConfig";
import ElevatorPitchAgent from "@pages/options/architect/agents/ElevatorPitchAgent";

class ArchitectAgentFactory extends BaseAgentFactory {
  create(config: GluonConfigure): ElevatorPitchAgent {
    return new ElevatorPitchAgent(this.thoughtAgentProps(config));
  }
}

export default ArchitectAgentFactory;
