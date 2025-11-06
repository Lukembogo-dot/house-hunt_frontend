import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

// Get the API URL from your environment variables
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    // 1. Create the socket connection
    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
    });
    setSocket(newSocket);

    // 4. Disconnect when the component unmounts
    return () => {
      newSocket.disconnect();
    };
  }, []); // Only runs once

  useEffect(() => {
    if (socket && user) {
      // 2. When we have a user, emit "setup" to join their private room
      socket.emit('setup', user._id);
      
      socket.on('connected', () => {
        console.log('Socket.io: Connected and setup successful.');
      });

    } else if (socket) {
      // 3. If user logs out, disconnect
      socket.disconnect();
    }
  }, [socket, user]); // Re-run when user or socket changes

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};