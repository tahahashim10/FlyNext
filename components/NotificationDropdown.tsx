'use client';

import React, { useEffect, useState } from 'react';
// We no longer need to extract "token" since cookies are sent automatically.
import { useAuth } from '../context/AuthContext';

interface Notification {
  id: number;
  message: string;
  read: boolean;
  createdAt: string;
}

const NotificationDropdown: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // Removed: const { token } = useAuth();

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // ensures cookies are sent
      });
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

  const markAsRead = async (id: number) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notificationId: id }),
      });
      if (!res.ok) {
        console.error('Failed to mark notification as read');
      } else {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === id ? { ...notif, read: true } : notif
          )
        );
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
          {notifications.filter((n) => !n.read).length > 0 && (
            <span className="badge badge-xs badge-secondary indicator-item">
              {notifications.filter((n) => !n.read).length}
            </span>
          )}
        </div>
      </button>
      {dropdownOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white shadow-lg rounded-lg z-50">
          <div className="p-4">
            <h3 className="font-bold text-lg mb-2">Notifications</h3>
            {notifications.length === 0 ? (
              <p className="text-sm">No notifications.</p>
            ) : (
              <ul className="space-y-2">
                {notifications.map((notif) => (
                  <li
                    key={notif.id}
                    className={`p-2 border rounded cursor-pointer hover:bg-gray-100 ${
                      !notif.read ? 'bg-blue-100 font-bold' : 'bg-white'
                    }`}
                    onClick={() => markAsRead(notif.id)}
                  >
                    <p className="text-sm">{notif.message}</p>
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
