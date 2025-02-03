import BaseAgentFactory from "@src/shared/configurers/BaseAgentFactory";
import type { GluonConfigure } from "@src/shared/storages/gluonConfig";
import ElevatorPitchAgent from "@pages/options/architect/agents/ElevatorPitchAgent";
import UserJourneyAgent from "@pages/options/architect/agents/UserJourneyAgent";

class ArchitectAgentFactory extends BaseAgentFactory {
  createElevatorPitchAgent(config: GluonConfigure): ElevatorPitchAgent {
    return new ElevatorPitchAgent(this.thoughtAgentProps(config));
  }

  createUserJourneyAgent(config: GluonConfigure): UserJourneyAgent {
    return new UserJourneyAgent(this.thoughtAgentProps(config));
  }
}

export default ArchitectAgentFactory;
