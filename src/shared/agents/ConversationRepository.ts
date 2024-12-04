import Conversation from "./Conversation";

interface ConversationRepository {
  save(conversation: Conversation): Promise<string>;
}

export default ConversationRepository;
