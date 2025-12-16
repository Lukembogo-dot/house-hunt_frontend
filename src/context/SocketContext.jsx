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

      // ✅ 2. --- NOTIFICATION HANDLERS ---

      const handleBrowserNotification = (title, body, url) => {
        if (Notification.permission === 'granted') {
          const n = new Notification(title, { body, icon: '/vite.svg' });
          n.onclick = () => { window.focus(); if (url) window.location.href = url; };
        }
      };

      // A. Standard Notifications (Database/System)
      socket.on('newNotification', (newNotification) => {
        addNotification(newNotification);

        // Only trigger browser notification if it's NOT a chat message 
        // (because we handle chat messages separately with better content in 'newMessage')
        if (!newNotification.message.includes('You have a new message from')) {
          handleBrowserNotification('New Notification', newNotification.message, newNotification.link);
        }
      });

      // B. Chat Messages (Browser Notification Only)
      socket.on('newMessage', (msg) => {
        // Only if we are NOT the sender
        if (msg.sender !== user._id) {
          // Trigger Browser Notification with Content Preview
          // (We do NOT add to Bell here, because backend 'newNotification' event handles that)
          const preview = msg.content.substring(0, 30) + (msg.content.length > 30 ? '...' : '');
          handleBrowserNotification('New Message', preview, `/chat/${msg.conversation}`);
        }
      });

    } else if (socket) {
      socket.disconnect();
    }

    // ✅ 3. Add cleanup function
    return () => {
      if (socket) {
        socket.off('connected');
        socket.off('newNotification');
        socket.off('newMessage'); // ✅ Clean up chat listener
      }
    };
  }, [socket, user, addNotification]); // Add addNotification to dependency array

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};