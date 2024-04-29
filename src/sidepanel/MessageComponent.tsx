import "./MessageComponent.css";
import 'github-markdown-css/github-markdown.css';

class Message {
  role: string;
  content: string;

  constructor(role: string, content: string) {
    this.role = role;
    this.content = content;
  }
}

function MessageComponent(msg: any) {
  if (msg.role == "assistant") {
    return (
      <div className="bot-message">
        <img className="bot-avatar" src="icons/gm_logo.png"/>
        <div className="bot-message-content">
            <div className="markdown-body">
                <p>{msg.content}</p>
            </div>
        </div>
      </div>
    )
  } else {
    return (
      <div className="user-message">
        <div className="user-message-content">
            <div className="markdown-body">
                <p>{msg.content}</p>
            </div>
        </div>
        <img className="user-avatar" src="icons/user-icon.png"/>
      </div>
    )
  }
}

export default MessageComponent;
