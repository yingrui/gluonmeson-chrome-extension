import ConversationRepository from "@src/shared/agents/ConversationRepository";
import Conversation from "@src/shared/agents/Conversation";

interface ConversationRecord {
  key: string;
  uuid: string;
  datetime: string;
  rounds: number;
  recordStatus: "Kept" | "Plan to delete";
  states: string[];
}

class LocalConversationRepository implements ConversationRepository {
  private storage = chrome.storage.local;

  async save(conversation: Conversation): Promise<string> {
    const key = conversation.getKey();
    await this.storage.set({ [key]: conversation });
    return key;
  }

  async find(key: string): Promise<any> {
    const value = await this.storage.get([key]);
    return value;
  }

  delete(key: string): void {
    this.storage.remove(key).then((r) => console.warn("remove: " + key));
  }

  async findAll(): Promise<ConversationRecord[]> {
    const keys = await this.storage.getKeys();
    const conversationKeys = keys.filter((key) =>
      key.startsWith("conversation_"),
    );
    const conversations = [];
    for (const key of conversationKeys) {
      const value = await this.storage.get([key]);
      const conversation = value[key];
      const defaultDialogueState = "chat";
      const record = {
        uuid: conversation.uuid,
        key: conversation.key,
        datetime: conversation.datetime,
        rounds: conversation.interactions.length,
        states: conversation.interactions.map((_) =>
          _.state ? _.state : defaultDialogueState,
        ),
        recordStatus: conversation.recordStatus ?? "Plan to delete",
      };
      conversations.push(record);
    }
    return conversations;
  }
}

export default LocalConversationRepository;
export type { ConversationRecord };
