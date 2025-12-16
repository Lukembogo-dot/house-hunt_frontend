import React, { useState } from 'react';
import { FaBell } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext'; // ✅ 1. Import useAuth

// ❌ We no longer need apiClient, useSocket, useEffect, etc.

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);

  // ✅ 2. Get all notification data from the AuthContext
  const { notifications, unreadCount, markNotificationsAsRead } = useAuth();

  // Track permission locally to force re-render when it changes
  const [perm, setPerm] = useState(Notification.permission);

  const handleEnablePush = () => {
    Notification.requestPermission().then(permission => {
      setPerm(permission);
    });
  };

  // ❌ All local state (notifications, unreadCount) is removed.
  // ❌ All useEffect listeners (fetchNotifications, socket.on) are removed.

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      // ✅ 3. Call the function from AuthContext
      markNotificationsAsRead();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
      >
        <FaBell size={22} />
        {/* ✅ 4. This now reads directly from context state */}
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 z-50"
          onClick={() => setIsOpen(false)}
        >
          <div className="p-3 border-b dark:border-gray-700 flex justify-between items-center">
            <h4 className="font-semibold text-gray-800 dark:text-gray-100">Notifications</h4>
            {Notification.permission === 'default' && (
              <button
                onClick={() => Notification.requestPermission()}
                className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition"
              >
                Enable Push
              </button>
            )}
          </div>
          {/* ✅ 5. This now reads directly from context state */}
          {notifications.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {notifications.map(noti => (
                <Link
                  key={noti._id}
                  to={noti.link}
                  className="block p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  {/* We can use noti.isRead from context to keep it bold/normal */}
                  <p className={`text-sm text-gray-700 dark:text-gray-300 ${!noti.isRead ? 'font-bold' : ''}`}>
                    {noti.message}
                  </p>
                  <p className="text-xs text-blue-500 mt-1">
                    {formatDistanceToNow(new Date(noti.createdAt), { addSuffix: true })}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="p-4 text-sm text-center text-gray-500 dark:text-gray-400">
              You have no notifications.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;