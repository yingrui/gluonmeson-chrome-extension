'use strict';

import './sidepanel.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import OpenAI from 'openai';

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

  document.getElementById('messageForm').addEventListener('submit', function(event) {
      event.preventDefault(); 
  
      const userInput = document.getElementById('userInput');
      if (userInput.value.trim() !== '') {
          console.log(event);
          console.log(client);
      }
  });
})();
  