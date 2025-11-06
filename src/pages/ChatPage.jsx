import React, { useState, useEffect } from 'react';
import { Link, Outlet, useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { FaSpinner, FaInbox } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

const ChatPage = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const { id: activeConversationId } = useParams(); // Get active chat ID from URL

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
  }, [activeConversationId]); // Refetch when we change conversations

  if (loading) {
    return <div className="flex justify-center items-center h-96"><FaSpinner className="animate-spin text-3xl text-blue-500" /></div>;
  }

  if (error) {
    return <p className="text-center text-red-500 p-10">{error}</p>;
  }

  // Find the other user in a conversation
  const getOtherParticipant = (convo) => {
    return convo.participants.find(p => p._id !== user._id);
  };

  return (
    <div className="container mx-auto h-[calc(100vh-80px)] max-h-[900px] flex py-10 gap-6">
      
      {/* Column 1: Conversation List (Inbox) */}
      <div className="w-1/3 max-w-sm flex-shrink-0 bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700 overflow-y-auto">
        <div className="p-4 border-b dark:border-gray-700">
          <h2 className="text-2xl font-bold dark:text-white">Messages</h2>
        </div>
        
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
              const isUnread = lastMsg && lastMsg.receiver === user._id && !lastMsg.isRead;

              return (
                <Link
                  key={convo._id}
                  to={`/chat/${convo._id}`}
                  className={`block p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition ${convo._id === activeConversationId ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                >
                  <div className="flex items-center space-x-3">
                    <img 
                      src={otherUser?.profilePicture} 
                      alt={otherUser?.name} 
                      className="w-12 h-12 rounded-full object-cover" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className={`font-semibold dark:text-white truncate ${isUnread ? 'font-bold' : ''}`}>
                          {otherUser?.name}
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
      
      {/* Column 2: Active Chat Window */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700 flex flex-col">
        {/* Outlet will render the selected chat or a placeholder */}
        <Outlet />
      </div>
    </div>
  );
};

export default ChatPage;