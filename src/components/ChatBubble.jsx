// src/components/ChatBubble.jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// ✅ 1. Import new icons
import { FaTimes, FaPaperPlane, FaExternalLinkAlt } from 'react-icons/fa';
import { Sparkles, MessageSquare } from 'lucide-react'; // Better icons from Lucide
import apiClient from '../api/axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';

// ... (inside component)



// ✅ 3. NEW: Updated link parser function
const ParseAndLinkText = ({ text, onLinkClick }) => {
  if (!text) return null;

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


import { useAuth } from '../context/AuthContext'; // ✅ Import Auth Hook

// ... (existing imports)

// --- Main ChatBubble Component ---
const ChatBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: "Jambo! I'm HouseHunt AI, your dedicated guide. Tell me what you're looking for, or ask for advice on neighborhoods and prices.",
      suggestions: ["Help me find a rental", "Check land prices", "Neighborhood guides"]
    },
  ]);
  const chatEndRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth(); // ✅ Get User Context

  // ✅ New Context-Aware Popup State
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ✅ AUTO-HIDE LOGIC: Delay 4s -> Show -> Stay 4s -> Hide
  useEffect(() => {
    // Static greeting message
    const staticGreeting = "👋 Hello, I am HouseHunt Kenya assistant ready to guide you through!";
    setPopupMessage(staticGreeting);

    // Timer 1: Delay appearance by 4 seconds
    const startTimer = setTimeout(() => {
      if (!isOpen) {
        setShowPopup(true);

        // Timer 2: Hide after 4 seconds of visibility
        const hideTimer = setTimeout(() => {
          setShowPopup(false);
        }, 4000);

        return () => clearTimeout(hideTimer);
      }
    }, 4000);

    return () => clearTimeout(startTimer);
  }, [isOpen]);


  const sendMessage = async (messageText) => {
    if (isLoading) return;

    // --- RATE LIMIT CHECK ---
    const RATE_LIMIT_KEY = `chat_limit_${user?._id}`;
    const MAX_REQUESTS = 5;
    const TIME_WINDOW = 8 * 60 * 60 * 1000; // 8 Hours

    let isMasterAdmin = user?.role === 'admin';
    // If specific "Master Admin" email is needed, add check here: user?.email === 'master@admin.com'

    if (user && !isMasterAdmin) {
      const storedData = JSON.parse(localStorage.getItem(RATE_LIMIT_KEY) || '{}');
      const now = Date.now();

      // Initialize or Reset if expired
      if (!storedData.startTime || (now - storedData.startTime > TIME_WINDOW)) {
        storedData.startTime = now;
        storedData.count = 0;
      }

      if (storedData.count >= MAX_REQUESTS) {
        setMessages(prev => [...prev, { role: 'user', text: messageText }]);
        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: 'ai',
            text: "🔒 You have reached your daily message limit (5 requests / 8 hrs). Please try again later or contact an agent directly.",
            suggestions: ["Contact Agent", "Browse Listings"]
          }]);
        }, 500);
        return; // 🛑 BLOCK REQUEST
      }

      // Increment Count
      storedData.count += 1;
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(storedData));
    }

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

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  // ✅ AUTH REDIRECT HANDLER
  const handleLoginRedirect = () => {
    setIsOpen(false);
    navigate('/login', { state: { from: location } });
  };

  return (
    <>
      {/* --- Context Popup Bubble --- */}
      <AnimatePresence>
        {showPopup && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-40 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-3 rounded-xl shadow-xl border border-blue-100 dark:border-blue-900 max-w-xs cursor-pointer group"
            onClick={() => { setIsOpen(true); setShowPopup(false); }}
          >
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white dark:bg-gray-800 border-b border-l border-blue-100 dark:border-blue-900 transform -rotate-45"></div>
            <div className="flex items-start gap-3 relative z-10">
              <div className="bg-blue-100 dark:bg-blue-900/50 p-1.5 rounded-full text-blue-600 dark:text-blue-400">
                <Sparkles size={14} />
              </div>
              <div>
                <p className="text-xs font-semibold leading-relaxed">{popupMessage}</p>
                <p className="text-[10px] text-gray-400 mt-1 font-medium group-hover:text-blue-500 transition-colors">Click to ask AI</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setShowPopup(false); }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <FaTimes size={12} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            <div
              className={`flex justify-between items-center p-4 border-b dark:border-gray-700 flex-shrink-0 transition-all ${isLoading ? 'border-b-blue-500 shadow-blue-500/20 shadow-lg' : ''
                }`}
            >
              <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <Sparkles className="text-blue-500" size={18} />
                HouseHunt AI Guide
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* ✅ AUTH LOCK SCREEN */}
            {!user ? (
              <div className="flex-grow flex flex-col items-center justify-center p-8 text-center bg-gray-50 dark:bg-gray-800/50">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
                  <Sparkles size={32} />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Unlock AI Search
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-8 leading-relaxed">
                  Log in to search for properties using natural language, such as <span className="italic font-medium text-gray-800 dark:text-gray-200">"I want a one bedroom apartment under 15,000 KES"</span>.
                </p>
                <button
                  onClick={handleLoginRedirect}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-lg shadow-blue-500/30"
                >
                  Log In to Chat
                </button>
                <p className="mt-4 text-xs text-gray-500">
                  Checking specific bills? Asking about safety? It's all here.
                </p>
              </div>
            ) : (
              /* ✅ LOGGED IN: SHOW CHAT INTERFACE */
              <>
                <div className="flex-grow p-4 overflow-y-auto">
                  {messages.map((msg, index) => (
                    <ChatMessage
                      key={index}
                      message={msg}
                      onSuggestionClick={handleSuggestionClick}
                      onLinkClick={handleLinkClick}
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

                <form
                  onSubmit={handleSubmit}
                  className="p-4 border-t dark:border-gray-700 flex-shrink-0"
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Describe your dream home or ask a question..."
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
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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