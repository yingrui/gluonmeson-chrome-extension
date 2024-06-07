## Add an Agent and Command for Google Search
### Step 1: Add a new agent
Add a new agent to the `src/pages/sidepanel/agents` directory. The agent should be a Python class that inherits from `AgentWithTools` and implements the `executeCommand` method. The `executeCommand` method should return `Promise<Stream<ChatCompletionChunk> | ChatCompletion>`. 
```typescript
// This is the GoogleAgent, it can be used to search on Google
class GoogleAgent extends AgentWithTools {
  constructor(defaultModelName: string, client: OpenAI) {
    super(defaultModelName, client);
  }
  ...
```

### Step 2: Implement the `executeCommand` method
Implement the `executeCommand` method in the agent. The method should take a command and arguments as input and return the result of the command. The method should throw an error if the command is not recognized.
```typescript
async executeCommand(command: string, args: object): Promise<any> {
 if (command === "google") {
   return this.search(args["userInput"]);
 }
 throw new Error("Unexpected tool call in GoogleAgent: " + command);
}
```

### Step 3: Implement the `search` method
Implement the `search` method in the agent. The method should take a search query as input and return the search results. The method should use the `openai` client to make the search request.
```typescript
async search(userInput: string): Promise<any> {
  // This method is used to open Google and wait for the search result.
 const url = await this.openGoogle(userInput);
 const content = await this.get_google_result(url, userInput);
 const prompt = `...`;
 // Then summarize the search result for user.
 return await this.chatCompletion([
   { role: "system", content: prompt },
   { role: "user", content: "please summarize this page: " },
 ]);
```

### Step 4: Add the agent to the agent list
Add command `google` to GluonMesonAgent commands list. Call `addAgent` method in constructor method.