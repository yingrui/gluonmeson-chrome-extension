import OpenAI from "openai";
import Tool from "./Tool";
import ThoughtAgent from "./ThoughtAgent";
import Conversation from "./Conversation";
import ThinkResult from "@src/shared/agents/ThinkResult";

/**
 * Composite Agent
 * @extends {ThoughtAgent} - Agent with tools
 */
class CompositeAgent extends ThoughtAgent {
  mapToolsAgents = {};
  chatCompletionTools: OpenAI.Chat.Completions.ChatCompletionTool[] = [];
  subAgents: ThoughtAgent[] = [];

  constructor(
    defaultModelName,
    toolsCallModel,
    client,
    language,
    name: string = "Guru",
    description: string = "Guru, your browser assistant",
    conversation: Conversation = new Conversation(),
    agents: ThoughtAgent[] = [],
  ) {
    super(
      defaultModelName,
      toolsCallModel,
      client,
      language,
      name,
      description,
      conversation,
    );

    for (const agent of agents) {
      this.addAgent(agent);
    }
  }

  /**
   * Add the agent
   * 1. Add agent tools to the chat completion tools
   * 2. Map the tools agents
   * @constructor
   * @param {ThoughtAgent} agent - Agent
   * @returns {void}
   */
  private addAgent(agent: ThoughtAgent): void {
    this.subAgents.push(agent);
    for (const tool of agent.getTools()) {
      this.getTools().push(tool);
      const toolCall = tool.getFunction();
      this.chatCompletionTools.push(toolCall);
      this.mapToolsAgents[toolCall.function.name] = agent;
    }
  }

  /**
   * Override the addTool function, add the tool to chatCompletionTools and mapToolsAgents
   */
  addTool(name: string, description: string, stringParameters: string[]): Tool {
    const tool = super.addTool(name, description, stringParameters);
    const toolCall = tool.getFunction();
    this.chatCompletionTools.push(toolCall);
    this.mapToolsAgents[toolCall.function.name] = this;
    return tool;
  }

  /**
   * Implement the executeAction function of ThoughtAgent
   * 1. Find the agent from the mapToolsAgents, and throw an error if not found
   * 2. Hand off the action to the agent
   * @param {string} command - Command
   * @param {object} args - Arguments
   * @param {Conversation} conversation - Conversation
   * @returns {Promise<ThinkResult>} ChatCompletion
   * @async
   * @throws {Error} Unexpected action in CompositeAgent({agent}): {action}
   */
  async executeAction(
    action: string,
    args: object,
    conversation: Conversation,
  ): Promise<ThinkResult> {
    const agent = this.mapToolsAgents[action];
    if (agent) {
      return agent.execute([{ name: action, arguments: args }], conversation);
    } else {
      throw new Error(
        `Unexpected action in CompositeAgent(${this.getName()}): ${action}`,
      );
    }
  }
}

export default CompositeAgent;
