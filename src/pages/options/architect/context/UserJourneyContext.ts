import { GluonConfigure } from "@src/shared/storages/gluonConfig";
import LocalStorage from "@pages/options/architect/repositories/LocalRepository";
import ArchitectAgentFactory from "@pages/options/architect/agents/ArchitectAgentFactory";
import UserJourneyAgent from "@pages/options/architect/agents/UserJourneyAgent";

class UserJourneyContext {
  private config: GluonConfigure;
  private storage: LocalStorage;
  private agent: UserJourneyAgent;

  constructor(config: GluonConfigure) {
    this.config = config;
    this.storage = new LocalStorage();
    this.agent = new ArchitectAgentFactory().createUserJourneyAgent(config);
  }

  async load(): Promise<string> {
    return await this.storage.get("userJourney");
  }

  getAgent(): UserJourneyAgent {
    return this.agent;
  }
}

export default UserJourneyContext;
