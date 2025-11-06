// src/components/ChatBubble.jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaComments, FaTimes, FaPaperPlane } from 'react-icons/fa';
import apiClient from '../api/axios'; // We'll use this later

// This component renders a single chat message
const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`px-4 py-3 rounded-lg max-w-xs lg:max-w-md ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
        }`}
      >
        {message.text}
      </div>
    </div>
  );
};

// This is the main ChatBubble component
const ChatBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: "Hello! I'm your AI assistant. Ask me anything about our properties or locations, like 'Find me a house in Kilimani under 100k'.",
    },
  ]);
  const chatEndRef = useRef(null);

  // Automatically scroll to the bottom when new messages appear
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // --- THIS IS THE REAL CODE WE WILL USE LATER ---
      // ✅ FIX: Removed the extra '/api' from the path.
      const { data } = await apiClient.post('/ai/chat', {
        message: input,
        // history: messages, // Send context (optional)
      });

      const aiResponse = {
        role: 'ai',
        text: data.response, // Assuming backend sends { response: "..." }
      };
      
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Failed to fetch AI response:", error);
      const errorResponse = {
        role: 'ai',
        text: error.response?.data?.response || "Sorry, I'm having a little trouble connecting. Please try again in a moment.",
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* --- The Chat Window --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-24 right-4 sm:right-6 md:right-8 w-[calc(100%-2rem)] sm:w-96 h-[60vh] sm:h-[70vh] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 flex-shrink-0">
              <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">
                AI Assistant
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-grow p-4 overflow-y-auto">
              {messages.map((msg, index) => (
                <ChatMessage key={index} message={msg} />
              ))}
              {isLoading && (
                <div className="flex justify-start mb-3">
                  <div className="px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-300"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSubmit}
              className="p-4 border-t dark:border-gray-700 flex-shrink-0"
            >
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me about properties..."
                  className="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition active:scale-95 disabled:opacity-50"
                  disabled={isLoading}
                >
                  <FaPaperPlane />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- The Floating Button --- */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-4 sm:right-6 md:right-8 z-50 bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
        aria-label="Toggle AI Chat"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isOpen ? 'times' : 'comments'}
            initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
            transition={{ duration: 0.15 }}
          >
            {isOpen ? <FaTimes size={24} /> : <FaComments size={24} />}
          </motion.div>
        </AnimatePresence>
      </motion.button>
    </>
  );
};

export default ChatBubble;