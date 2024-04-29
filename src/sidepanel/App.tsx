import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import MessageComponent from './MessageComponent';
import "./App.css";
import 'github-markdown-css/github-markdown.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap/dist/react-bootstrap.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

import OpenAI from 'openai';
import jQuery from 'jquery';

function App() {

  const storage = chrome.storage.local;
  let modelName = 'gpt-3.5-turbo';
  let organization = '';
  var client: OpenAI;
  storage.get('configure', function (items) {
    if (!!items.configure) {
      organization = items.configure.organization;
      client = new OpenAI({
        apiKey: items.configure.apiKey,
        baseURL: items.configure.baseURL,
        dangerouslyAllowBrowser: true
      });
    }
  });

  const [messages, setList] = React.useState([
    {role: "system", content: "You're an assistant, please direct anwser questions, should not add assistant in anwser."},
    {role: "assistant", content: "Hello! How can I assist you today?"}
  ]);

  async function submit() {
    let message = jQuery("#input-message").val() as string;
    jQuery("#input-message").val("");
    appendMessage("user", message);

    const chatCompletion = await client.chat.completions.create({
      messages: (messages as OpenAI.ChatCompletionMessageParam[]),
      model: modelName,
    });
    appendMessage("assistant", chatCompletion.choices[0].message.content as string);
  } 

  function appendMessage(role: string, content: string) {
    messages.push({role: role, content: content});
    setList([...messages]);
  }

  async function keypress(e: any) {
    var code = e.keyCode ? e.keyCode : e.which;
    if (code == 13 && !e.shiftKey) {
      e.preventDefault();
      await submit();
    }
  }

  return (
    <>
      <div className="chat-box" id="chat-box">
        { 
          messages.filter((msg) => msg.role != "system")
            .map((msg, i) => <MessageComponent key={i}  {...msg}></MessageComponent>) 
        }
      </div>
      <div id="message-form">
        <InputGroup className="input-group mb-3 input-form">
          <Form.Control as="textarea" id="input-message" className="form-control"
            onKeyDown={keypress}
            placeholder="Type a message..." style={{ resize: "none" }} />
          <Button variant="outline-secondary" type="button" id="submit-button" onClick={submit}><i className="bi bi-play-fill"></i></Button>
        </InputGroup>
      </div>
    </>
  );
}

export default App;
