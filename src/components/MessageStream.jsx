import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  FaPaperPlane,
  FaSpinner,
  FaWhatsapp,
  FaUserSlash // 1. IMPORT THE 'USER SLASH' ICON
} from 'react-icons/fa';
import { useSocket } from '../context/SocketContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';

const MessageStream = () => {
  const { id: conversationId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const socket = useSocket();

  // 2. UPDATED FOR SAFETY
  // This now checks if 'p' exists (is not null) before trying
  // to access p._id, which prevents a crash if a user was deleted.
  const otherParticipant = conversation?.participants.find(p => p && p._id !== user._id);

  // 3. NEW VARIABLE TO CONTROL CHAT STATE
  // If the other participant is not found (i.e., is null/deleted),
  // this variable will be true.
  const isChatDisabled = !otherParticipant;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        // This will now include 'whatsappNumber' in the participant data
        const { data } = await apiClient.get(`/chat/conversations/${conversationId}`);
        setMessages(data.messages);
        setConversation(data.conversation);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [conversationId]);

  useEffect(() => {
    setTimeout(scrollToBottom, 100);
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    socket.on('newMessage', (incomingMessage) => {
      if (incomingMessage.conversation === conversationId) {
        setMessages((prevMessages) => [...prevMessages, incomingMessage]);
      }
    });

    return () => {
      socket.off('newMessage');
    };
  }, [socket, conversationId]);


  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isChatDisabled) return; // Don't send if disabled

    setSending(true);
    try {
      const { data: sentMessage } = await apiClient.post(`/chat/conversations/${conversationId}`, {
        content: newMessage,
      });
      setMessages((prevMessages) => [...prevMessages, sentMessage]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><FaSpinner className="animate-spin text-3xl text-blue-500" /></div>;
  }

  if (!conversation) {
    return <div className="flex justify-center items-center h-full text-gray-500">Conversation not found.</div>;
  }

  const messageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, scale: 0.8 }
  };

  return (
    <>
      {/* Chat Header */}
      <motion.div
        className="p-4 border-b dark:border-gray-700 flex items-center space-x-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* 4. --- NEW CONDITIONAL HEADER --- */}
        {isChatDisabled ? (
          // Case 1: User is DELETED
          <>
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
              <FaUserSlash className="text-gray-500 dark:text-gray-400" />
            </div>
            <div>
              <p className="font-semibold dark:text-white">User Not Available</p>
              <Link
                to={`/properties/${conversation.property}`}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                View Property
              </Link>
            </div>
          </>
        ) : (
          // Case 2: User EXISTS (Normal)
          <>
            <img
              src={otherParticipant.profilePicture}
              alt={otherParticipant.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <div className="flex items-center space-x-2">
                <p className="font-semibold dark:text-white">{otherParticipant.name}</p>
              </div>
              <Link
                to={`/properties/${conversation.property}`}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                View Property
              </Link>
            </div>
          </>
        )}
        {/* --- END OF CONDITIONAL HEADER --- */}
      </motion.div>

      {/* Message List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg._id}
              className={`flex ${msg.sender === user._id ? 'justify-end' : 'justify-start'}`}
              layout
              variants={messageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow ${msg.sender === user._id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-200'
                }`}>
                <p>{msg.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Form */}
      <motion.div
        className="p-4 border-t dark:border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            // 5. UPDATE PLACEHOLDER AND DISABLED PROP
            placeholder={isChatDisabled ? "This user is no longer available" : "Type your message..."}
            className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            autoComplete="off"
            disabled={sending || isChatDisabled}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-full p-3 hover:bg-blue-700 transition disabled:opacity-50"
            // 6. UPDATE DISABLED PROP
            disabled={sending || !newMessage.trim() || isChatDisabled}
          >
            <FaPaperPlane />
          </button>
        </form>

        {/* 7. ADD THE "NO LONGER AVAILABLE" MESSAGE */}
        {isChatDisabled && (
          <p className="pt-2 text-center text-sm text-gray-500 dark:text-gray-400 italic">
            You can no longer send messages in this conversation.
          </p>
        )}
      </motion.div>
    </>
  );
};

export default MessageStream;