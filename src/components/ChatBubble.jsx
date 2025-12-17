// src/components/ChatBubble.jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// ✅ 1. Import new icons
import { FaTimes, FaPaperPlane, FaExternalLinkAlt } from 'react-icons/fa';
import { Sparkles, MessageSquare } from 'lucide-react'; // Better icons from Lucide
import apiClient from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';

// ... (inside component)



// ✅ 3. NEW: Updated link parser function
const ParseAndLinkText = ({ text, onLinkClick }) => {
  // Regex to find markdown links [text](url) or keywords
  const regex = /(\[.*?\]\(.*?\))|(\bAbout Us\b)|(\bContact Us\b)/g;

  // This is a complex function, so we split the text into parts
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    // Handle the match
    let url = '';
    let linkText = '';

    if (match[1]) { // Markdown link: [Title](/properties/123)
      linkText = match[1].substring(1, match[1].indexOf(']'));
      url = match[1].substring(match[1].indexOf('(') + 1, match[1].length - 1);
    } else if (match[2]) { // "About Us"
      linkText = 'About Us';
      url = '/about';
    } else if (match[3]) { // "Contact Us"
      linkText = 'Contact Us';
      url = '/contact';
    }

    const isExternal = url.startsWith('http') || url.startsWith('mailto:') || url.startsWith('tel:');

    if (isExternal) {
      parts.push(
        <a
          key={match.index}
          href={url}
          target={url.startsWith('http') ? "_blank" : "_self"}
          rel={url.startsWith('http') ? "noopener noreferrer" : ""}
          onClick={(e) => e.stopPropagation()} // ✅ STOP PROPAGATION to prevent chat toggling
          className="font-semibold text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 inline-flex items-center space-x-1"
        >
          <span>{linkText}</span>
          <FaExternalLinkAlt size={10} />
        </a>
      );
    } else {
      parts.push(
        <Link
          key={match.index}
          to={url}
          onClick={onLinkClick} // ✅ Close chat on click (Internal only)
          className="font-semibold text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 inline-flex items-center space-x-1"
        >
          <span>{linkText}</span>
          {/* Internal links generally dont need external icon, but keeping style consistent if preferred, else remove icon */}
        </Link>
      );
    }
    lastIndex = match.index + match[0].length;
  }

  // Add any remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  // Render the parts, splitting by newlines
  return (
    <div className="flex flex-col space-y-2">
      {parts.map((part, index) => {
        if (typeof part === 'string') {
          return part.split('\n').map((line, lineIndex) => (
            <p key={`${index}-${lineIndex}`}>{line}</p>
          ));
        }
        return part;
      })}
    </div>
  );
};


// --- Chat Message Component ---
const ChatMessage = ({ message, onSuggestionClick, onLinkClick }) => {
  const isUser = message.role === 'user';

  const messageVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
    >
      <div>
        <div
          className={`px-4 py-3 rounded-lg max-w-xs lg:max-w-md ${isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
            }`}
        >
          {/* ✅ 4. Use the new parser component */}
          <ParseAndLinkText text={message.text} onLinkClick={onLinkClick} />
        </div>

        {message.suggestions && message.suggestions.length > 0 && (
          <motion.div
            className="flex flex-wrap gap-2 mt-3"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.05 } }
            }}
          >
            {message.suggestions.map((suggestion, index) => (
              <motion.button
                key={index}
                variants={messageVariants}
                onClick={() => onSuggestionClick(suggestion)}
                className="px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-all active:scale-95"
              >
                {suggestion}
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};


// --- Main ChatBubble Component ---
const ChatBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: "Hello! I'm your AI assistant. Ask me anything about our properties or locations, like 'Find me a house in Kilimani under 100k'.",
      suggestions: ["Find properties for rent", "Find properties for sale", "About Us"]
    },
  ]);
  const chatEndRef = useRef(null);
  const navigate = useNavigate(); // ✅ 5. Get navigate hook

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (messageText) => {
    if (isLoading) return;

    const userMessage = { role: 'user', text: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { data } = await apiClient.post('/ai/chat', {
        message: messageText,
      });

      const aiResponse = {
        role: 'ai',
        text: data.response,
        suggestions: data.suggestions || [],
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Failed to fetch AI response:", error);
      const errorResponse = {
        role: 'ai',
        text: error.response?.data?.response || "Sorry, I'm having a little trouble connecting. Please try again in a moment.",
        suggestions: [],
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  const handleSuggestionClick = (suggestionText) => {
    sendMessage(suggestionText);
  };

  // ✅ 6. New handler to close chat when a link is clicked
  const handleLinkClick = () => {
    setIsOpen(false);
    // Note: The <Link> component will handle the navigation
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
            {/* ... (Header is unchanged) ... */}
            <div
              className={`flex justify-between items-center p-4 border-b dark:border-gray-700 flex-shrink-0 transition-all ${isLoading ? 'border-b-blue-500 shadow-blue-500/20 shadow-lg' : ''
                }`}
            >
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
                <ChatMessage
                  key={index}
                  message={msg}
                  onSuggestionClick={handleSuggestionClick}
                  onLinkClick={handleLinkClick} // ✅ 7. Pass handler down
                />
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

      {/* --- The Floating Button (Updated) --- */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 bg-blue-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${isLoading && !isOpen ? 'animate-pulse' : ''
          }`}
        aria-label="Toggle AI Chat"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isOpen ? 'times' : 'sparkles'}
            initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
            transition={{ duration: 0.15 }}
          >
            {isOpen ? <FaTimes size={20} /> : <Sparkles size={20} strokeWidth={2.5} />}
          </motion.div>
        </AnimatePresence>
      </motion.button>
    </>
  );
};

export default ChatBubble;