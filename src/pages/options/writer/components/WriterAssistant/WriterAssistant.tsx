import React, { useState, useRef } from "react";
import { Button, Layout, Mentions } from "antd";
import { RedoOutlined, CloseOutlined } from "@ant-design/icons";
import type { MentionsRef } from "antd/lib/mentions";
import { useScrollAnchor } from "@src/shared/hooks/use-scroll-anchor";

import "./WriterAssistant.css";
import WriterContext from "@pages/options/writer/context/WriterContext";
import WriterAgent from "@pages/options/writer/agents/WriterAgent";

// TODO: Choose one of the following import statements
// When your developing feature is not using Mermaid, use the following import statement:
// When ready for release, use the following import statement:
// import Message from "@src/shared/components/MessageWithoutMermaid";
import Message from "@src/shared/components/Message";

import { delay } from "@src/shared/utils";

const { Sider } = Layout;

interface WriterAssistantProps {
  context: WriterContext;
  agent: WriterAgent;
}

const WriterAssistant: React.FC<WriterAssistantProps> = ({
  context,
  agent,
}) => {
  const [chatCollapsed, setChatCollapsed] = useState(true);

  const mentionRef = useRef<MentionsRef>();
  const commandRef = useRef<boolean>();
  const [text, setText] = useState<string>();
  const [generating, setGenerating] = useState<boolean>();
  const [currentText, setCurrentText] = useState<string>();
  const [messages, setList] = useState<ChatMessage[]>(
    agent.getInitialMessages(),
  );
  const { scrollRef, scrollToBottom, messagesRef } = useScrollAnchor();

  const handleOnSelect = async () => {
    commandRef.current = true;
    await delay(200);
    commandRef.current = false;
  };

  async function keypress(e: any) {
    if (e.key == "Enter" && e.keyCode == 13 && !e.shiftKey) {
      e.preventDefault();
      if (!commandRef.current) {
        handleSubmit();
      }
    }
  }

  async function handleSubmit() {
    if (generating) {
      return;
    }
    if (!text || text.trim() === "") {
      setText("");
      return;
    }

    setGenerating(true);
    const userInput = text;
    setText("");
    if (userInput) {
      appendMessage("user", userInput);
    }
    const result = await agent.chat(messages[messages.length - 1]);
    const message = await agent
      .onReceiveStreamMessage((msg) => {
        setCurrentText(msg);
        setTimeout(() => {
          scrollToBottom();
        });
      })
      .onCompleted(result);

    appendMessage("assistant", message);
    setCurrentText("");
    setGenerating(false);

    setTimeout(() => {
      scrollToBottom();
    });
  }

  function appendMessage(role: ChatMessage["role"], content: string) {
    let name = "";
    if (role === "user") {
      name = "You";
    } else if (role === "assistant") {
      name = "Guru";
    }

    const message = { role: role, content: content, name: name };
    messages.push(message);
    setList([...messages]);
  }

  function clearMessages() {
    const messages = agent.getInitialMessages();
    setList(messages);
    setText("");
    agent.getConversation().set(messages);
  }

  return (
    <Sider
      id="writer-right-sider"
      width={400}
      collapsedWidth={36}
      trigger={null}
      collapsible
      collapsed={chatCollapsed}
    >
      <div className="chat">
        <div className="chat-sider-header">
          {chatCollapsed ? null : (
            <>
              <img src="/icons/gm_logo.png" />
              <h6>Chat</h6>
            </>
          )}
          <Button
            type="text"
            icon={
              chatCollapsed ? (
                <img src="/icons/gm_logo.png" />
              ) : (
                <CloseOutlined />
              )
            }
            onClick={() => setChatCollapsed(!chatCollapsed)}
            style={{
              fontSize: "16px",
              width: 36,
              height: 64,
              float: "right",
            }}
          />
          <Button
            type="text"
            icon={<RedoOutlined />}
            onClick={() => clearMessages()}
            style={{
              fontSize: "16px",
              width: 36,
              height: 64,
              float: "right",
              display: chatCollapsed ? "none" : "flex",
            }}
          />
        </div>
        <div
          className="chat-sider-body"
          style={{
            display: chatCollapsed ? "none" : "flex",
          }}
        >
          <div className="chat-list">
            <div>
              {messages
                .filter((msg) => msg.role != "system")
                .map((msg, i) => (
                  <Message
                    key={i}
                    index={i}
                    role={msg.role}
                    name={msg.name}
                    content={msg.content}
                  ></Message>
                ))}
              {generating && (
                <Message
                  role="assistant"
                  name="..."
                  content={currentText}
                  loading
                ></Message>
              )}
              <div className="helper" ref={messagesRef}></div>
            </div>
          </div>
          <div className="chat-form">
            <Mentions
              ref={mentionRef}
              onSelect={handleOnSelect}
              onKeyUp={keypress}
              prefix={"/"}
              value={text}
              disabled={generating}
              readOnly={generating}
              options={agent.getCommandOptions()}
              placeholder="Hit Enter to send the message..."
              onChange={(value) => {
                setText(value);
              }}
              autoSize={{ minRows: 2, maxRows: 4 }}
            />
          </div>
        </div>
      </div>
    </Sider>
  );
};

export default WriterAssistant;
