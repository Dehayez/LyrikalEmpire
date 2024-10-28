const { Client } = require('discord-rpc');
const clientId = '1300401825169670204';

const rpc = new Client({ transport: 'ipc' });

rpc.on('ready', () => {
  console.log('Discord RPC connected');
  setActivity();
});

const setActivity = (songTitle = 'No song playing', artist = 'Unknown artist') => {
  if (!rpc) {
    return;
  }

  rpc.setActivity({
    details: `Listening to ${songTitle}`,
    state: `by ${artist}`,
    startTimestamp: Date.now(),
    largeImageKey: '../../public/apple-touch-icon.png', 
    largeImageText: 'Lyrikal Empire',
    smallImageKey: '../../public/apple-touch-icon.png',
    smallImageText: 'Playing music',
    instance: false,
  });
};

rpc.login({ clientId }).catch(console.error);

module.exports = { setActivity };