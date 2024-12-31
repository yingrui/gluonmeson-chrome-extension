import ThoughtAgent, {
  ThoughtAgentProps,
} from "@src/shared/agents/ThoughtAgent";
import WriterContext from "@src/pages/options/writer/context/WriterContext";
import Environment from "@src/shared/agents/core/Environment";

class WriterAgent extends ThoughtAgent {
  context: WriterContext;

  constructor(props: ThoughtAgentProps, context: WriterContext) {
    super(props);
    this.context = context;
  }

  private async getScreenshot(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      chrome.tabs.captureVisibleTab(null, (dataUrl) => {
        resolve(dataUrl);
      });
    });
  }

  async environment(): Promise<Environment> {
    const screenshot = this.enableMultimodal
      ? await this.getScreenshot()
      : undefined;
    return new Promise<Environment>((resolve, reject) => {
      const title = this.context.getTitle();
      const content = this.context.getContent();

      if (title) {
        resolve({
          systemPrompt: `As an article writer assistant by GluonMeson, named Guru Mason. Here’s how you can help users:

* Title: you can help users with the title of the article.
* Outline: you can help users with the structure of the article.

Please answer questions in ${this.language}.
Current user is working on article
Title: ${title}
Content:
${content}.`,
          screenshot,
        });
      } else {
        resolve({
          systemPrompt: `As an assistant named Guru Mason. You can help users writing with given information.`,
          screenshot,
        });
      }
    });
  }
}

export default WriterAgent;
