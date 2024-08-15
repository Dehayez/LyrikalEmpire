# Lyrikal Empire

## Overview

Lyrikal Empire is a full-stack web application designed to manage and play audio files. The project is divided into two main parts: the client and the server.

## Installation

To install and set up the project, follow these steps:
### Clone the repository:
```
git clone https://github.com/your-username/lyrikalempire.git
cd lyrikalempire
```

### Install dependencies for the client:
```
cd client
yarn install
```

### Install dependencies for the server:
```
cd ../server
yarn install
```
## Project Structure

client/ .gitignore package.json public/ index.html manifest.json robots.txt site.webmanifest uploads/ README.md src/ App.js App.scss App.test.js components/ AddBeat/ AudioPlayer/ BeatList/ Buttons/ ConfirmModal/ ContextMenu/ Form/ Header/ Highlight/ contexts/ globals/ hooks/ index.js index.scss reportWebVitals.js services/ setupTests.js utils/ package.json README.md server/ .env .gitignore package.json server.js

## Available Scripts

### Client

In the [`client`](command:_github.copilot.openRelativePath?%5B%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2FUsers%2FDehayez%2FSites%2Flyrikalempire%2Fclient%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%5D "/Users/Dehayez/Sites/lyrikalempire/client") directory, you can run:

- **`yarn start`**: Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser. The page will reload when you make changes. You may also see any lint errors in the console.
- **`yarn test`**: Launches the test runner in the interactive watch mode. See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.
- **`yarn run build`**: Builds the app for production to the [`build`](command:_github.copilot.openSymbolFromReferences?%5B%22build%22%2C%5B%7B%22uri%22%3A%7B%22%24mid%22%3A1%2C%22fsPath%22%3A%22%2FUsers%2FDehayez%2FSites%2Flyrikalempire%2FREADME.md%22%2C%22external%22%3A%22file%3A%2F%2F%2FUsers%2FDehayez%2FSites%2Flyrikalempire%2FREADME.md%22%2C%22path%22%3A%22%2FUsers%2FDehayez%2FSites%2Flyrikalempire%2FREADME.md%22%2C%22scheme%22%3A%22file%22%7D%2C%22pos%22%3A%7B%22line%22%3A17%2C%22character%22%3A14%7D%7D%5D%5D "Go to definition") folder. It correctly bundles React in production mode and optimizes the build for the best performance. The build is minified and the filenames include the hashes. Your app is ready to be deployed! See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
- **`yarn run eject`**: This command will remove the single build dependency from your project. It will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc.) right into your project so you have full control over them. **Note: this is a one-way operation. Once you [`eject`](command:_github.copilot.openSymbolFromReferences?%5B%22eject%22%2C%5B%7B%22uri%22%3A%7B%22%24mid%22%3A1%2C%22fsPath%22%3A%22%2FUsers%2FDehayez%2FSites%2Flyrikalempire%2FREADME.md%22%2C%22external%22%3A%22file%3A%2F%2F%2FUsers%2FDehayez%2FSites%2Flyrikalempire%2FREADME.md%22%2C%22path%22%3A%22%2FUsers%2FDehayez%2FSites%2Flyrikalempire%2FREADME.md%22%2C%22scheme%22%3A%22file%22%7D%2C%22pos%22%3A%7B%22line%22%3A18%2C%22character%22%3A14%7D%7D%5D%5D "Go to definition"), you can't go back!**

### Server

In the [`server`](command:_github.copilot.openRelativePath?%5B%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2FUsers%2FDehayez%2FSites%2Flyrikalempire%2Fserver%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%5D "/Users/Dehayez/Sites/lyrikalempire/server") directory, you can run:

- **`yarn start`**: Starts the server using [`node server.js`](command:_github.copilot.openSymbolFromReferences?%5B%22node%20server.js%22%2C%5B%7B%22uri%22%3A%7B%22%24mid%22%3A1%2C%22fsPath%22%3A%22%2FUsers%2FDehayez%2FSites%2Flyrikalempire%2FREADME.md%22%2C%22external%22%3A%22file%3A%2F%2F%2FUsers%2FDehayez%2FSites%2Flyrikalempire%2FREADME.md%22%2C%22path%22%3A%22%2FUsers%2FDehayez%2FSites%2Flyrikalempire%2FREADME.md%22%2C%22scheme%22%3A%22file%22%7D%2C%22pos%22%3A%7B%22line%22%3A4%2C%22character%22%3A151%7D%7D%5D%5D "Go to definition").

### Root

In the root directory, you can run:

- **`yarn start`**: Opens MAMP, waits for it to be ready, and then concurrently starts both the client and server. The client runs on [http://localhost:3000](http://localhost:3000) and the server runs on [http://localhost:4000](http://localhost:4000).

## Ports

- **Client**: [http://localhost:3000](http://localhost:3000)
- **Server**: [http://localhost:4000](http://localhost:4000)
- **MySQL**: [http://localhost:8889](http://localhost:8889)

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
