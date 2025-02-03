import { GluonConfigure } from "@src/shared/storages/gluonConfig";
import LocalStorage from "@pages/options/architect/repositories/LocalRepository";
import ArchitectAgentFactory from "@pages/options/architect/agents/ArchitectAgentFactory";
import UserJourneyAgent from "@pages/options/architect/agents/UserJourneyAgent";
import { UserJourneyRecord } from "@pages/options/architect/entities/UserJourneyRecord";

class UserJourneyContext {
  private config: GluonConfigure;
  private storage: LocalStorage<UserJourneyRecord>;
  private agent: UserJourneyAgent;

  constructor(config: GluonConfigure) {
    this.config = config;
    this.storage = new LocalStorage();
    this.agent = new ArchitectAgentFactory().createUserJourneyAgent(config);
  }

  async load(): Promise<UserJourneyRecord> {
    return await this.storage.get("userJourney");
  }

  async save(userJourney: UserJourneyRecord): Promise<void> {
    await this.storage.put("userJourney", userJourney);
  }

  getAgent(): UserJourneyAgent {
    return this.agent;
  }
}

export default UserJourneyContext;
