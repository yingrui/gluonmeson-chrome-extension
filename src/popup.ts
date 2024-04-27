'use strict';

import './popup.css';

(function () {

  const storage = chrome.storage.local;

  function setInputElementValue(id: string, value: string): void {
    let inputElement = document.getElementById(id);
    if (!!inputElement && inputElement instanceof HTMLInputElement) {
      inputElement.value = value;
    }
  }

  function loadChanges() {
    storage.get('configure', function (items: any) {
      if (!!items && !!items.configure) {
        setInputElementValue('apiKey', items.configure.apiKey);
        setInputElementValue('baseURL', items.configure.baseURL);
        setInputElementValue('organization', items.configure.organization);
      }
    });
  }

  loadChanges();


  let form = document.getElementById('settings-form');
  if (form)
    form.addEventListener('submit', async function(event) {
      event.preventDefault();

      const apiKey = (document.getElementById('apiKey') as HTMLInputElement).value;
      const baseURL = (document.getElementById('baseURL') as HTMLInputElement).value;
      const organization = (document.getElementById('organization') as HTMLInputElement).value;

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
