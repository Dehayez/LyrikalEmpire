const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { Client } = require('discord-rpc');

const clientId = '1300401825169670204';

const rpc = new Client({ transport: 'ipc' });

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL('http://localhost:3000');

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', () => {
  createWindow();

  rpc.login({ clientId }).catch(console.error);

  rpc.on('ready', () => {
    console.log('Discord RPC connected');
  });

  ipcMain.on('set-activity', (event, songTitle) => {
    if (!rpc || !rpc.transport || !rpc.transport.socket) {
      return;
    }

    rpc.setActivity({
      details: `Listening to ${songTitle}`,
      state: 'on Lyrikal Empire',
      startTimestamp: Date.now(),
      largeImageKey: 'le_large',
      largeImageText: 'Lyrikal Empire',
      instance: false,
    }).catch(console.error);
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});