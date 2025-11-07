import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  
  // ✅ 1. Get the user *and* the new addNotification function from AuthContext
  const { user, addNotification } = useAuth();

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
    });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []); 

  useEffect(() => {
    if (socket && user) {
      // Setup user room
      socket.emit('setup', user._id);
      
      socket.on('connected', () => {
        console.log('Socket.io: Connected and setup successful.');
      });

      // ✅ 2. --- THIS IS THE GLOBAL LISTENER ---
      // Listen for the 'newNotification' event
      socket.on('newNotification', (newNotification) => {
        // Call the function from AuthContext to update the global state
        addNotification(newNotification);
      });
      // -----------------------------------------

    } else if (socket) {
      socket.disconnect();
    }
    
    // ✅ 3. Add cleanup function
    return () => {
      if (socket) {
        socket.off('connected');
        socket.off('newNotification');
      }
    };
  }, [socket, user, addNotification]); // Add addNotification to dependency array

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};