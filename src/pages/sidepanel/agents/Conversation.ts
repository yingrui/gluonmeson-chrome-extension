import Tool from "./Tool";

class Conversation {
  messages: ChatMessage[];

  constructor(messages: ChatMessage[] = []) {
    this.messages = messages;
  }

  appendMessages(messages: ChatMessage[]): Conversation {
    //     console.log("appendMessages", messages);
    const message = messages.slice(-1)[0];
    return this.appendMessage(message);
  }

  appendMessage(message: ChatMessage): Conversation {
    //     console.log("appendMessage", message);
    if (message.role === "user") {
      return this.appendUserMessage(message);
    } else if (message.role === "assistant") {
      return this.appendAssistantMessage(message);
    }
    return this;
  }

  appendUserMessage(message: ChatMessage): Conversation {
    if (message.role === "user") {
      this.messages.push(message);
    } else {
      console.error("Only user messages can be appended to the conversation");
    }
    //     console.log("conversation.appendUserMessage", this.messages);
    return this;
  }

  appendAssistantMessage(message: ChatMessage): Conversation {
    if (message.role === "assistant") {
      this.messages.push(message);
    } else {
      console.error(
        "Only assistant messages can be appended to the conversation",
      );
    }
    //     console.log("conversation.appendAssistantMessage", this.messages);
    return this;
  }

  set(messages: ChatMessage[]): Conversation {
    this.messages = [...messages];
    //     console.log("conversation.set", this.messages);
    return this;
  }

  getMessages() {
    return this.messages;
  }
}

export default Conversation;
