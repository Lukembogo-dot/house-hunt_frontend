import React, { useState, useEffect } from 'react';
import { Link, Outlet, useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  FaSpinner,
  FaInbox,
  FaArrowLeft,
  FaUserSlash // 1. IMPORT THE 'USER SLASH' ICON
} from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const ChatPage = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const { id: activeConversationId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const { data } = await apiClient.get('/chat/conversations');
        setConversations(data);
      } catch (err) {
        setError('Failed to load conversations.');
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  const getOtherParticipant = (convo) => {
    // 2. UPDATED FOR SAFETY
    // This now checks if 'p' exists (is not null) before trying
    // to access p._id, which prevents a crash if a user was deleted.
    return convo.participants.find(p => p && p._id !== user._id);
  };

  const sidebarVariants = {
    hidden: { x: '-100%', opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 }
  };

  const chatVariants = {
    hidden: { x: '100%', opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <FaSpinner className="animate-spin text-3xl text-blue-500" />
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500 p-10">{error}</p>;
  }

  // --- Main Responsive Layout ---
  return (
    // ✅ --- FIX IS HERE: Changed pt-20 to mt-20 ---
    // This moves the *entire component* down 80px to clear the header.
    <div className="container mx-auto h-[calc(100vh-80px)] max-h-[900px] flex mt-20 pb-4 md:pb-10 gap-6 overflow-hidden">

      {/* Added `overflow-hidden` here to clip the animations. */}
      <div className="md:flex w-full h-full gap-6 relative overflow-hidden">

        {/* ================================================= */}
        {/* Column 1: Conversation List (Sidebar) */}
        {/* ================================================= */}
        <AnimatePresence>
          <motion.div
            key="sidebar"
            className={`w-full md:w-1/3 md:max-w-sm flex-shrink-0 bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700 flex-col overflow-hidden
              ${activeConversationId ? 'hidden md:flex' : 'flex'}`
            }
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className="p-4 border-b dark:border-gray-700">
              <h1 className="text-2xl font-bold dark:text-white">Messages</h1>
            </div>

            <div className="overflow-y-auto flex-1">
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  <FaInbox className="mx-auto text-4xl mb-3" />
                  <p>You have no messages.</p>
                </div>
              ) : (
                <div className="divide-y dark:divide-gray-700">
                  {conversations.map(convo => {
                    const otherUser = getOtherParticipant(convo);
                    const lastMsg = convo.lastMessage;

                    // 3. --- NEW LOGIC FOR DELETED USER ---
                    // If the other user is null (deleted), we show a
                    // disabled "ghost" conversation item.
                    if (!otherUser) {
                      return (
                        <div
                          key={convo._id}
                          className="block p-4 bg-gray-50 dark:bg-gray-800 opacity-60 cursor-not-allowed"
                        >
                          <div className="flex items-center space-x-3">
                            {/* Ghost Avatar */}
                            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                              <FaUserSlash className="text-gray-500 dark:text-gray-400" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center">
                                {/* --- LINT FIX: Removed redundant 'font-semibold' --- */}
                                <p className="dark:text-white truncate font-bold">
                                  User Not Available
                                </p>
                                <p className="text-xs text-gray-400 flex-shrink-0">
                                  {lastMsg && formatDistanceToNow(new Date(lastMsg.createdAt), { addSuffix: true })}
                                </p>
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate italic">
                                This conversation is no longer available.
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    // --- END OF NEW LOGIC ---

                    // If the user is NOT deleted, show the normal item:
                    const isUnread = lastMsg && lastMsg.receiver === user._id && !lastMsg.isRead;

                    return (
                      <Link
                        key={convo._id}
                        to={`/chat/${convo._id}`}
                        className={`block p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition ${convo._id === activeConversationId ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={otherUser.profilePicture}
                            alt={otherUser.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <p className={`font-semibold dark:text-white truncate ${isUnread ? 'font-bold' : ''}`}>
                                {otherUser.name}
                              </p>
                              <p className="text-xs text-gray-400 flex-shrink-0">
                                {lastMsg && formatDistanceToNow(new Date(lastMsg.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                            <p className={`text-sm text-gray-500 dark:text-gray-400 truncate ${isUnread ? 'text-gray-800 dark:text-gray-200 font-bold' : ''}`}>
                              {lastMsg?.content || '...'}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ================================================= */}
        {/* Column 2: Active Chat Window (Main Content) */}
        {/* ================================================= */}
        <AnimatePresence>
          <motion.div
            key="chat-window"
            className={`flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700 flex-col
              ${activeConversationId ? 'flex' : 'hidden md:flex'}`
            }
            variants={chatVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* --- Mobile Back Button --- */}
            {activeConversationId && (
              <button
                onClick={() => navigate('/chat')}
                className="md:hidden p-4 border-b dark:border-gray-700 flex items-center space-x-2 text-blue-600 dark:text-blue-400"
              >
                <FaArrowLeft />
                <span>All Messages</span>
              </button>
            )}

            {/* Outlet will render MessageStream or ChatPlaceholder */}
            <div className="flex-1 flex flex-col min-h-0">
              <Outlet />
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
};

export default ChatPage;
