class Interaction {
  state: string; // State is the description of user intents, for example: "Searching", "Viewing", etc.
  intent: string; // The specific intent, for example: "google_search", "open_url", etc.
  intentArguments?: any; // The arguments of the intent
  status: string; // the status of agent: "Intent Recognition" | "Reflecting" | "Executing" | "Completed"
  statusMessage: string; // the message of the status
  agentName: string; // the name of the agent
  inputMessage: ChatMessage;
  inputMessageIndex: number;
  outputMessage?: ChatMessage;

  listener: () => void;

  public constructor(chatMessage: ChatMessage, chatMessages: ChatMessage[]) {
    this.state = "";
    this.intent = "";
    this.status = "Start";
    this.statusMessage = "";
    this.agentName = "";
    this.inputMessage = chatMessage;
    this.inputMessageIndex = chatMessages.lastIndexOf(chatMessage);
  }

  public setOutputMessage(message: ChatMessage) {
    this.outputMessage = message;
  }

  public setStatus(status: string, statusMessage: string) {
    this.status = status;
    this.statusMessage = statusMessage;
    this.notify();
  }

  public getStatus(): string {
    return this.status;
  }

  public getStatusMessage(): string {
    return this.statusMessage;
  }

  public setState(state: string, intent: string, intentArguments: any) {
    this.state = state;
    this.intent = intent;
    this.intentArguments = intentArguments;
    this.notify();
  }

  public setAgentName(agent: string) {
    this.agentName = agent;
    this.notify();
  }

  private notify() {
    this.listener && this.listener();
  }

  public onChange(listener: () => void) {
    this.listener = listener;
  }
}

export default Interaction;
