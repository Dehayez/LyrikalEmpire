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
    console.log('📤 emitAudioPlay called with:', data);
    console.log('📤 Socket state:', { exists: !!socket, isConnected, socketId: socket?.id });
    if (socket && isConnected) {
      console.log('📤 Emitting audio-play to server:', data);
      socket.emit('audio-play', data);
      console.log('📤 Audio-play emitted successfully');
    } else {
      console.log('⚠️ Cannot emit audio-play - not connected', { socket: !!socket, isConnected });
    }
  };

  const emitAudioPause = (data) => {
    console.log('📤 emitAudioPause called with:', data);
    console.log('📤 Socket state:', { exists: !!socket, isConnected, socketId: socket?.id });
    if (socket && isConnected) {
      console.log('📤 Emitting audio-pause to server:', data);
      socket.emit('audio-pause', data);
      console.log('📤 Audio-pause emitted successfully');
    } else {
      console.log('⚠️ Cannot emit audio-pause - not connected', { socket: !!socket, isConnected });
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

  console.log('🔌 WebSocket context value:', {
    hasSocket: !!socket,
    isConnected,
    socketId: socket?.id,
    hasEmitFunctions: !!(emitAudioPlay && emitAudioPause)
  });

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}; 