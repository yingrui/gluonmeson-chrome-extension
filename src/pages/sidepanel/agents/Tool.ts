import OpenAI from "openai";

class Tool {
  name: string;
  description: string;
  properties: any;
  userInputAsArgument: string;

  constructor(name: string, description: string) {
    this.name = name;
    this.description = description;
    this.properties = {};
  }

  addStringParameter(name: string) {
    this.properties[name] = { type: "string" };
  }

  setUserInputAsArgument(name: string) {
    this.userInputAsArgument = name;
  }

  getFunction(): OpenAI.Chat.Completions.ChatCompletionTool {
    if (Object.keys(this.properties).length > 0) {
      return {
        type: "function",
        function: {
          name: this.name,
          description: this.description,
          parameters: {
            type: "object",
            properties: this.properties,
          },
        },
      };
    }

    return {
      type: "function",
      function: {
        name: this.name,
        description: this.description,
      },
    };
  }
}

export default Tool;
