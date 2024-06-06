# <img src="public/icons/gm_logo.png" width="45" align="left"> GluonMeson Chrome Extension

GluonMeson Chrome Extension is Chrome Web Browser Copilot

## Features

* **Summary**: Quickly grasp the main points of any extensive text with our efficient summarization tool.
* **Ask Page**: Receive answers based on the content of the web page you are currently viewing.
* **Google**: Conduct Google searches right from your browser, ensuring you get the most relevant information swiftly.
* **Translate**: Effortlessly translate content between Chinese and English or into other specified languages.
* **Generate Story**: Automatically create engaging narrative content for new Trello board cards.
* **Generate Text**: Craft specific texts for various purposes, boosting your creativity and efficiency.

## Build or Install

### Build from Source Code

1. Run npm install
2. Run build command:
    - Dev: `pnpm dev` or `npm run dev`
    - Prod: `pnpm build` or `npm run build`
3. Follow steps 2 to 5 in [Install from Release file](#install-from-release-file).

### Install from Release file
1. Download & unzip the latest release zip file from [releases page](https://github.com/yingrui/gluonmeson-chrome-extension/releases).
2. Open in browser - `chrome://extensions`
3. Check - `Developer mode`
4. Find and Click - `Load unpacked extension`
5. Select - unzipped file folder or `dist` folder if you build from source code

<img src="public/setup_chrome_extension.png"/>

### Setup Configurations
Please setup below configurations in the extension popup page: 
* **API Key**: Get from OpenAI or GluonMeson Platform
* **Base URL**: OpenAI API URL or GluonMeson Model API URL
* **Organization**: Your Organization Name
* **GPT Model**: gpt-3.5-turbo is default
* **Tools Call Model**: gpt-4-turbo, if it's empty, will not use tools call to recognize user intents.

<img src="public/configuration.png"/>