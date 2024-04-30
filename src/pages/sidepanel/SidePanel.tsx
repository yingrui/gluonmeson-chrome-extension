import React, { useState } from "react";
import "@pages/sidepanel/SidePanel.css";
import withSuspense from "@src/shared/hoc/withSuspense";
import withErrorBoundary from "@src/shared/hoc/withErrorBoundary";
import { Input } from "antd";
import styles from "./SidePanel.module.scss";

import Message from "./components/MessageComponent";

import OpenAI from "openai";

const storage = chrome.storage.local;
const modelName = "gpt-3.5-turbo";
let organization = "";
let client: OpenAI;

storage.get("configure", function (items) {
  if (items.configure) {
    organization = items.configure.organization;
    client = new OpenAI({
      apiKey: items.configure.apiKey,
      baseURL: items.configure.baseURL,
      dangerouslyAllowBrowser: true,
    });
  }
});

function SidePanel() {
  const [text, setText] = useState<string>();
  const [currentText, setCurrentText] = useState<string>();
  const [loading, setLoading] = useState<boolean>();

  const [messages, setList] = React.useState<ChatMessage[]>([
    {
      role: "system",
      content:
        "You're an assistant, please direct answer questions, should not add assistant in anwser.",
    },
    { role: "assistant", content: "Hello! How can I assist you today?" },
  ]);

  async function handleSubmit() {
    setLoading(true);

    appendMessage("user", text);

    const stream = await client.chat.completions.create({
      messages: messages as OpenAI.ChatCompletionMessageParam[],
      model: modelName,
      stream: true,
    });

    let message = "";

    for await (const chunk of stream) {
      const finishReason = chunk.choices[0]?.finish_reason;
      console.log(chunk.choices[0]);
      const content = chunk.choices[0]?.delta?.content;
      message = message + content;
      setCurrentText(message);
    }

    appendMessage("assistant", message);
    setCurrentText("");
    setText("");
    setLoading(false);
  }

  function appendMessage(role: ChatMessage["role"], content: string) {
    messages.push({ role: role, content: content });
    setList([...messages]);
  }

  async function keypress(e: any) {
    const code = e.keyCode ? e.keyCode : e.which;
    if (code == 13 && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className={styles.chat}>
      <div className={styles.chatList}>
        {messages
          .filter((msg) => msg.role != "system")
          .map((msg, i) => (
            <Message key={i} role={msg.role} content={msg.content}></Message>
          ))}
        {currentText && (
          <Message role="assistant" content={currentText}></Message>
        )}
      </div>

      <div className={styles.form}>
        <Input.TextArea
          autoFocus
          disabled={loading}
          onKeyDown={keypress}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
          }}
          autoSize={{ minRows: 2, maxRows: 4 }}
        />
      </div>
    </div>
  );
}

export default withErrorBoundary(
  withSuspense(SidePanel, <div> Loading ... </div>),
  <div> Error Occur </div>,
);
