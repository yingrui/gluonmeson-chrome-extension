import { useRef, useState, useEffect } from "react";
import withSuspense from "@src/shared/hoc/withSuspense";
import withErrorBoundary from "@src/shared/hoc/withErrorBoundary";
import { useScrollAnchor } from "./hooks/use-scroll-anchor";
import { Mentions, Typography } from "antd";
import styles from "./SidePanel.module.scss";

import Message from "./components/Message";
import GluonMesonAgent from "./agents/GluonMesonAgent";
import {
  delay,
  installContentScriptCommandListener,
} from "@pages/sidepanel/utils";
import useStorage from "@root/src/shared/hooks/useStorage";
import configureStorage from "@root/src/shared/storages/gluonConfig";
import type { MentionsRef } from "antd/lib/mentions";

const { Text } = Typography;
function SidePanel(props: Record<string, unknown>) {
  const configStorage = useStorage(configureStorage);
  const mentionRef = useRef<MentionsRef>();
  const [text, setText] = useState<string>();
  const [currentText, setCurrentText] = useState<string>();
  const [generating, setGenerating] = useState<boolean>();
  const { scrollRef, scrollToBottom, messagesRef } = useScrollAnchor();
  const commandRef = useRef<boolean>();
  const agent = props.agent as GluonMesonAgent;
  const enableReflection = props.enableReflection as boolean;

  const [messages, setList] = useState<ChatMessage[]>(
    props.initMessages as ChatMessage[],
  );

  useEffect(() => {
    const focus = () => {
      if (mentionRef.current) {
        mentionRef.current.focus();
      }
    };
    focus();
    window.addEventListener("focus", focus);
    return () => {
      window.removeEventListener("focus", focus);
    };
  }, []);

  if (!configStorage.apiKey || !configStorage.baseURL) {
    return (
      <div className={styles.chat} style={{ justifyContent: "center" }}>
        <Text style={{ textAlign: "center" }}>
          Please complete the configuration first.
        </Text>
      </div>
    );
  }

  async function handleCommandFromContentScript(
    action: string,
    args: any,
    userInput: string,
  ) {
    if (generating) {
      return;
    }
    generateReply(userInput, () =>
      agent.execute(
        [{ name: action, arguments: args }],
        agent.getConversation(),
      ),
    );
  }

  installContentScriptCommandListener(handleCommandFromContentScript);

  async function handleSubmit() {
    if (generating) {
      return;
    }
    if (!text || text.trim() === "") {
      setText("");
      return;
    }
    // when command is clear, then clear the chat history
    if (
      text.startsWith("/clear") ||
      text.startsWith("/c") ||
      text.startsWith("/cl")
    ) {
      setList(agent.getInitialMessages());
      setText("");
      return;
    }
    const message = await generateReply(
      text,
      () => agent.chat(messages[messages.length - 1]),
      enableReflection,
    );
    if (enableReflection) {
      await reflection();
    }
  }

  async function generateReply(
    userInput: string,
    generate_func: () => Promise<any>,
  ): Promise<string> {
    setGenerating(true);
    try {
      setText("");
      if (userInput) {
        appendMessage("user", userInput);
      }

      const stream = await generate_func();
      const message = await showStreamingMessage(stream);

      appendMessage("assistant", message);
      agent.getConversation().appendMessage(messages[messages.length - 1]);
      setCurrentText("");
    } finally {
      setGenerating(false);
    }

    setTimeout(() => {
      scrollToBottom();
    });
    return message;
  }

  async function showStreamingMessage(stream): Promise<string> {
    let message = "";

    for await (const chunk of stream) {
      if (chunk.choices) {
        const finishReason = chunk.choices[0]?.finish_reason;
        const content = chunk.choices[0]?.delta?.content ?? "";
        message = message + content;
      } else {
        message = message + chunk.data;
      }

      setCurrentText(message);
      setTimeout(() => {
        scrollToBottom();
      });
    }
    return message;
  }

  async function reflection() {
    const actions = await agent.reflection();
    if (actions && actions.length > 0) {
      generateReply("", () => agent.execute(actions, agent.getConversation()));
    }
  }

  function appendMessage(role: ChatMessage["role"], content: string) {
    const message = { role: role, content: content };
    messages.push(message);
    setList([...messages]);
  }

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

  function getCommandOptions() {
    const options = agent.getCommandOptions();
    options.push({ value: "clear", label: "/clear" }); // add clear command
    return options;
  }

  return (
    <div className={styles.chat}>
      <div className={styles.chatList}>
        <div>
          {messages
            .filter((msg) => msg.role != "system")
            .map((msg, i) => (
              <Message key={i} role={msg.role} content={msg.content}></Message>
            ))}
          {generating && (
            <Message role="assistant" content={currentText} loading></Message>
          )}
          <div className="helper" ref={messagesRef}></div>
        </div>
      </div>

      <div className={styles.form}>
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
  );
}

export default withErrorBoundary(
  withSuspense(SidePanel, <div> Loading ... </div>),
  <div> Error Occur </div>,
);
