import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { FaPaperPlane, FaSpinner } from 'react-icons/fa';

const MessageStream = () => {
  const { id: conversationId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const otherParticipant = conversation?.participants.find(p => p._id !== user._id);

  // Function to scroll to the bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
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
  
  // Scroll to bottom when messages load
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const { data: sentMessage } = await apiClient.post(`/chat/conversations/${conversationId}`, {
        content: newMessage,
      });
      setMessages([...messages, sentMessage]);
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

  return (
    <>
      {/* Chat Header */}
      <div className="p-4 border-b dark:border-gray-700 flex items-center space-x-3">
        <img 
          src={otherParticipant?.profilePicture} 
          alt={otherParticipant?.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold dark:text-white">{otherParticipant?.name}</p>
          <Link 
            to={`/properties/${conversation.property}`} 
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            View Property
          </Link>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div 
            key={msg._id} 
            className={`flex ${msg.sender === user._id ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow ${
              msg.sender === user._id 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-200'
            }`}>
              <p>{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Form */}
      <div className="p-4 border-t dark:border-gray-700">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            autoComplete="off"
            disabled={sending}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-full p-3 hover:bg-blue-700 transition disabled:opacity-50"
            disabled={sending || !newMessage.trim()}
          >
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </>
  );
};

export default MessageStream;