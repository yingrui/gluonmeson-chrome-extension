'use strict';

import './popup.css';

(function () {

  const storage = chrome.storage.local;

  function loadChanges() {
    storage.get('configure', function (items) {
      if (!!items.configure) {
        document.getElementById('apiKey').value = items.configure.apiKey;
        document.getElementById('baseURL').value = items.configure.baseURL;
        document.getElementById('organization').value = items.configure.organization;
      }
    });
  }

  loadChanges();


  document.getElementById('settings-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const apiKey = document.getElementById('apiKey').value;
    const baseURL = document.getElementById('baseURL').value;
    const organization = document.getElementById('organization').value;

    // Save settings using Chrome Storage API or handle them as needed
    let configure = { apiKey: apiKey, baseURL: baseURL, organization: organization };
    await storage.set({configure: configure}, function() {
        alert('Settings have been saved successfully!');
    });
  });

  // Communicate with background file by sending a message
  chrome.runtime.sendMessage(
    {
      type: 'GREETINGS',
      payload: {
        message: 'Hello, my name is Pop. I am from Popup.',
      },
    },
    (response) => {
      console.log(response.message);
    }
  );
})();
