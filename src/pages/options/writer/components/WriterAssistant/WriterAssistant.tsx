import React, { useState, useRef } from "react";
import { Button, Layout, theme, Mentions, Typography } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import type { MentionsRef } from "antd/lib/mentions";
import { useScrollAnchor } from "@src/shared/hooks/use-scroll-anchor";

import "./WriterAssistant.css";
import WriterContext from "@pages/options/writer/context/WriterContext";
import Message from "@src/shared/components/Message";

const { Header, Content, Sider } = Layout;

const WriterAssistant: React.FC = (props: Record<string, unknown>) => {
  const context = props.context as WriterContext;

  const [chatCollapsed, setChatCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const mentionRef = useRef<MentionsRef>();
  const commandRef = useRef<boolean>();
  const [text, setText] = useState<string>();
  const [generating, setGenerating] = useState<boolean>();
  const [currentText, setCurrentText] = useState<string>();
  const [messages, setList] = useState<ChatMessage[]>(
    context.getInitialMessages(),
  );
  const { scrollRef, scrollToBottom, messagesRef } = useScrollAnchor();

  const handleSearchChange = async () => {
    commandRef.current = true;
    await delay(100);
    commandRef.current = false;
  };

  async function keypress(e: any) {
    if (e.key == "Enter" && !e.shiftKey) {
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

    setGenerating(true);
    const userInput = text;
    if (userInput) {
      appendMessage("user", userInput);
      setText("");
    }

    const message = "stub reply message...";
    appendMessage("assistant", message);
    setCurrentText(message);
    setGenerating(false);

    setTimeout(() => {
      scrollToBottom();
    });
  }

  function appendMessage(role: ChatMessage["role"], content: string) {
    const message = { role: role, content: content };
    messages.push(message);
    setList([...messages]);
  }

  function getCommandOptions() {
    const options = [];
    options.push({ value: "clear", label: "/clear" }); // add clear command
    return options;
  }

  return (
    <Sider
      id="writer-right-sider"
      width={400}
      collapsedWidth={64}
      trigger={null}
      collapsible
      collapsed={chatCollapsed}
    >
      <div className="chat">
        <div className="chat-sider-header">
          {chatCollapsed ? null : (
            <>
              <img src="/icons/gm_logo.png" />
              <h6>Chat with Guru</h6>
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
              width: 64,
              height: 64,
              float: "right",
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
                    role={msg.role}
                    content={msg.content}
                  ></Message>
                ))}
              {generating && (
                <Message
                  role="assistant"
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
              onSelect={handleSearchChange}
              onKeyUp={keypress}
              prefix={"/"}
              value={text}
              disabled={generating}
              readOnly={generating}
              options={getCommandOptions()}
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
