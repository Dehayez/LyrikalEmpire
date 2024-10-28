const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  setActivity: (songTitle) => {
    ipcRenderer.send('set-activity', songTitle);
  },
});