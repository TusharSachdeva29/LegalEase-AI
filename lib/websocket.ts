"use client";

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initializeSocket = async () => {
  if (socket && socket.connected) {
    return socket;
  }
  
  // Ensure the socket server is running
  await fetch('/api/websocket');
  
  socket = io({
    path: '/api/websocket',
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });
  
  return socket;
};

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  
  useEffect(() => {
    const setupSocket = async () => {
      const socketIo = await initializeSocket();
      
      socketIo.on('connect', () => {
        console.log('Socket.io connected');
        setIsConnected(true);
      });
      
      socketIo.on('disconnect', () => {
        console.log('Socket.io disconnected');
        setIsConnected(false);
      });
      
      socketIo.on('connect_error', (err) => {
        console.error('Socket.io connection error:', err);
        setIsConnected(false);
      });
    };
    
    setupSocket();
    
    return () => {
      // Don't disconnect on component unmount
      // This allows the socket to be reused
    };
  }, []);
  
  return { socket, isConnected };
};

export const getSocket = () => socket;
