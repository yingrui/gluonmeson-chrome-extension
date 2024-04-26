'use strict';

import './sidepanel.css';
import 'github-markdown-css/github-markdown.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import OpenAI from 'openai';
import jQuery from 'jquery';

(function () {
  
  const storage = chrome.storage.local;
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

  function submit() {
    let message = jQuery("#input-message").val();
    jQuery("#input-message").val("");
    console.log('message:', message);
    // TODO: send message to GluonMeson
  }

  jQuery('#submit-button').on('click', function(event) {
    event.preventDefault();
    submit();
  });
  
  jQuery('#input-message').on('keypress', function(e) {
    var code = e.keyCode ? e.keyCode : e.which;
    if (code == 13 && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  });
})();
  