import React, { useState, useEffect, useCallback } from 'react';
import { FaBell, FaRegBell } from 'react-icons/fa';
import apiClient from '../api/axios';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/notifications');
      setNotifications(data);
      const unread = data.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Optional: Poll for new notifications every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleOpen = async () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      // Mark all as read when dropdown is opened
      try {
        await apiClient.put('/notifications/read-all');
        setUnreadCount(0);
        // Optimistically update UI
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      } catch (error) {
        console.error('Failed to mark notifications as read:', error);
      }
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
      >
        <FaBell size={22} />
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
          onClick={() => setIsOpen(false)} // Close on click inside
        >
          <div className="p-3 border-b dark:border-gray-700">
            <h4 className="font-semibold text-gray-800 dark:text-gray-100">Notifications</h4>
          </div>
          {notifications.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {notifications.map(noti => (
                <Link
                  key={noti._id}
                  to={noti.link}
                  className="block p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
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