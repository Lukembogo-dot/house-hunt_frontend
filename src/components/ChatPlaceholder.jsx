import React from 'react';
import { FaComments } from 'react-icons/fa';

const ChatPlaceholder = () => {
  return (
    <div className="flex flex-col justify-center items-center h-full text-gray-400 dark:text-gray-500">
      <FaComments className="text-6xl mb-4" />
      <h3 className="text-xl font-semibold">Select a conversation</h3>
      <p>Choose one of your conversations from the list to start chatting.</p>
    </div>
  );
};

export default ChatPlaceholder;