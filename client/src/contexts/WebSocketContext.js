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
      console.log('🔌 Connected to WebSocket server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from WebSocket server');
      setIsConnected(false);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, []);

  const emitAudioPlay = (data) => {
    if (socket) {
      console.log('📤 Emitting audio-play:', data);
      socket.emit('audio-play', data);
    }
  };

  const emitAudioPause = (data) => {
    if (socket) {
      console.log('📤 Emitting audio-pause:', data);
      socket.emit('audio-pause', data);
    }
  };

  const emitAudioSeek = (data) => {
    if (socket) {
      console.log('📤 Emitting audio-seek:', data);
      socket.emit('audio-seek', data);
    }
  };

  const emitBeatChange = (data) => {
    if (socket) {
      console.log('📤 Emitting beat-change:', data);
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