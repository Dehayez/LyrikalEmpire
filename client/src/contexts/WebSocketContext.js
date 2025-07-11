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
    console.log('🔌 Initializing WebSocket connection to http://localhost:4000');
    const newSocket = io('http://localhost:4000');
    
    newSocket.on('connect', () => {
      console.log('🔌 Connected to WebSocket server, socket ID:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from WebSocket server');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('🔌 WebSocket connection error:', error);
    });

    // Add listeners for all audio events to debug
    newSocket.on('audio-play', (data) => {
      console.log('🎵 WebSocket received audio-play event:', data);
    });

    newSocket.on('audio-pause', (data) => {
      console.log('⏸️ WebSocket received audio-pause event:', data);
    });

    newSocket.on('audio-seek', (data) => {
      console.log('⏭️ WebSocket received audio-seek event:', data);
    });

    newSocket.on('beat-change', (data) => {
      console.log('🎶 WebSocket received beat-change event:', data);
    });

    console.log('🔌 WebSocket listeners set up, setting socket state');
    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      console.log('🔌 Cleaning up WebSocket connection');
      newSocket.close();
    };
  }, []);

  const emitAudioPlay = (data) => {
    if (socket && isConnected) {
      console.log('📤 Emitting audio-play:', data.beatId);
      socket.emit('audio-play', data);
    } else {
      console.log('⚠️ Cannot emit audio-play - not connected');
    }
  };

  const emitAudioPause = (data) => {
    if (socket && isConnected) {
      console.log('📤 Emitting audio-pause:', data.beatId);
      socket.emit('audio-pause', data);
    } else {
      console.log('⚠️ Cannot emit audio-pause - not connected');
    }
  };

  const emitAudioSeek = (data) => {
    if (socket && isConnected) {
      console.log('📤 Emitting audio-seek:', data);
      socket.emit('audio-seek', data);
    } else {
      console.log('⚠️ Cannot emit audio-seek - not connected');
    }
  };

  const emitBeatChange = (data) => {
    if (socket && isConnected) {
      console.log('📤 Emitting beat-change:', data);
      socket.emit('beat-change', data);
    } else {
      console.log('⚠️ Cannot emit beat-change - not connected');
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