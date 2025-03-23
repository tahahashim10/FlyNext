'use client';

import React, { useEffect, useState } from 'react';

interface Notification {
  id: number;
  message: string;
  read: boolean;
  createdAt: string;
}

const NotificationDropdown: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch unread notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications'); // Returns unread notifications
      if (!res.ok) {
        console.error('Failed to fetch notifications');
        return;
      }
      const data = await res.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Mark a notification as read
  const markAsRead = async (id: number) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      });
      if (!res.ok) {
        console.error('Failed to mark notification as read');
      } else {
        // Remove this notification from the list
        setNotifications((prev) => prev.filter((notif) => notif.id !== id));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <div className="relative">
      <button
        className="btn btn-ghost btn-circle"
        onClick={() => setDropdownOpen((prev) => !prev)}
      >
        <div className="indicator">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          {notifications.length > 0 && (
            <span className="badge badge-xs badge-secondary indicator-item">
              {notifications.length}
            </span>
          )}
        </div>
      </button>
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg z-50">
          <div className="p-4">
            <h3 className="font-bold text-lg mb-2">Notifications</h3>
            {notifications.length === 0 ? (
              <p className="text-sm">No unread notifications.</p>
            ) : (
              <ul className="space-y-2">
                {notifications.map((notif) => (
                  <li
                    key={notif.id}
                    className="p-2 border rounded cursor-pointer hover:bg-gray-100"
                    onClick={() => markAsRead(notif.id)}
                  >
                    <p className="text-sm font-semibold">{notif.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
