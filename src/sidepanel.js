'use strict';

import './sidepanel.css';
import 'github-markdown-css/github-markdown.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import OpenAI from 'openai';
import jQuery from 'jquery';

(function () {
  
  const storage = chrome.storage.local;
  let modelName = 'gpt-3.5-turbo';
  let organization = 'GluonMeson';
  let client = null;
  
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

  async function submit(onCompleted) {
    let message = jQuery("#input-message").val();
    jQuery("#input-message").val("");
    appendUserMessage(message);
    // TODO: send message to GluonMeson
    const chatCompletion = await client.chat.completions.create({
      messages: [{ role: 'user', content: message }],
      model: modelName,
    });
    appendBotMessage(chatCompletion.choices[0].message.content);
    onCompleted();
  }

  function appendUserMessage(message) {
    let div = jQuery(
      '<div class="user-message">'+
      ' <div class="user-message-content">'+
      '   <div class="markdown-body">'+
      '     <p>'+message+'</p>'+
      '   </div>'+
      ' </div>'+
      ' <img class="user-avatar" src="icons/user-icon.png" alt="logo"/>'+
      '</div>');
    jQuery('#chat-box').append(div);
  }

  function appendBotMessage(message) {
    let div = jQuery(
      '<div class="bot-message">'+
      ' <img class="bot-avatar" src="icons/gm_logo.png" alt="logo"/>'+
      ' <div class="bot-message-content">'+
      '   <div class="markdown-body">'+
      '     <p>'+message+'</p>'+
      '   </div>'+
      ' </div>'+
      '</div>');
    jQuery('#chat-box').append(div);
  }

  jQuery('#submit-button').on('click', function(event) {
    event.preventDefault();
    submit(function(){
      console.log('completed');
    });
  });
  
  jQuery('#input-message').on('keypress', function(e) {
    var code = e.keyCode ? e.keyCode : e.which;
    if (code == 13 && !e.shiftKey) {
      e.preventDefault();
      submit(function(){
        console.log('completed');
      });
    }
  });
})();
  