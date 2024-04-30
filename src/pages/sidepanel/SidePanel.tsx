import React from "react";
import "@pages/sidepanel/SidePanel.css";
import withSuspense from "@src/shared/hoc/withSuspense";
import withErrorBoundary from "@src/shared/hoc/withErrorBoundary";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import MessageComponent from "./components/MessageComponent";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-bootstrap/dist/react-bootstrap.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";

import OpenAI from "openai";
import jQuery from "jquery";

function SidePanel() {
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

  const [messages, setList] = React.useState<ChatMessage[]>([
    {
      role: "system",
      content:
        "You're an assistant, please direct anwser questions, should not add assistant in anwser.",
    },
    { role: "assistant", content: "Hello! How can I assist you today?" },
  ]);

  async function submit() {
    const message = jQuery("#input-message").val() as string;
    jQuery("#input-message").val("");
    appendMessage("user", message);

    const chatCompletion = await client.chat.completions.create({
      messages: messages as OpenAI.ChatCompletionMessageParam[],
      model: modelName,
    });
    appendMessage(
      "assistant",
      chatCompletion.choices[0].message.content as string,
    );
  }

  function appendMessage(role: ChatMessage["role"], content: string) {
    messages.push({ role: role, content: content });
    setList([...messages]);
  }

  async function keypress(e: any) {
    const code = e.keyCode ? e.keyCode : e.which;
    if (code == 13 && !e.shiftKey) {
      e.preventDefault();
      await submit();
    }
  }

  return (
    <>
      <div className="chat-box" id="chat-box">
        {messages
          .filter((msg) => msg.role != "system")
          .map((msg, i) => (
            <MessageComponent
              key={i}
              role={msg.role}
              content={msg.content}
            ></MessageComponent>
          ))}
      </div>
      <div id="message-form">
        <InputGroup className="input-group mb-3 input-form">
          <Form.Control
            as="textarea"
            id="input-message"
            className="form-control"
            onKeyDown={keypress}
            placeholder="Type a message..."
            style={{ resize: "none" }}
          />
          <Button
            variant="outline-secondary"
            type="button"
            id="submit-button"
            onClick={submit}
          >
            <i className="bi bi-play-fill"></i>
          </Button>
        </InputGroup>
      </div>
    </>
  );
}

export default withErrorBoundary(
  withSuspense(SidePanel, <div> Loading ... </div>),
  <div> Error Occur </div>,
);
