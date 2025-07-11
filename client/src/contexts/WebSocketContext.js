import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to WebSocket server
    const newSocket = io('http://localhost:4000');
    
    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, []);

  const emitAudioPlay = (data) => {
    if (socket && isConnected) {
      socket.emit('audio-play', data);
    }
  };

  const emitAudioPause = (data) => {
    if (socket && isConnected) {
      socket.emit('audio-pause', data);
    }
  };

  const emitAudioSeek = (data) => {
    if (socket && isConnected) {
      socket.emit('audio-seek', data);
    }
  };

  const emitBeatChange = (data) => {
    if (socket && isConnected) {
      socket.emit('beat-change', data);
    }
  };

  const value = {
    socket,
    isConnected,
    emitAudioPlay,
    emitAudioPause,
    emitAudioSeek,
    emitBeatChange,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}; 