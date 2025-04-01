
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell } from 'lucide-react';

interface Notification {
  id: number;
  message: string;
  read: boolean;
  createdAt: string;
}

const NotificationDropdown: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const notificationsPerPage = 5;

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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

  // Calculate pagination
  const totalPages = Math.ceil(notifications.length / notificationsPerPage);
  const indexOfLastNotification = currentPage * notificationsPerPage;
  const indexOfFirstNotification = indexOfLastNotification - notificationsPerPage;
  const currentNotifications = notifications.slice(
    indexOfFirstNotification,
    indexOfLastNotification
  );

  return (
    <div className="relative">
      <button
        className="p-2 rounded-full hover:bg-muted/10 transition-colors relative"
        onClick={() => setDropdownOpen((prev) => !prev)}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {notifications.filter((n) => !n.read).length > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {notifications.filter((n) => !n.read).length}
          </span>
        )}
      </button>
      
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-card shadow-card rounded-lg z-50 border border-border overflow-hidden">
          <div className="p-4">
            <h3 className="font-bold text-lg border-b border-border pb-2 mb-3">Notifications</h3>
            {notifications.length === 0 ? (
              <p className="text-sm text-muted py-4 text-center">No notifications.</p>
            ) : (
              <>
                <div className="max-h-60 overflow-y-auto">
                  <ul className="space-y-2">
                    {currentNotifications.map((notif) => (
                      <li
                        key={notif.id}
                        className={`p-3 rounded-md cursor-pointer hover:bg-muted/10 transition-colors ${
                          !notif.read ? 'bg-primary/5 border-l-2 border-primary' : 'bg-card'
                        }`}
                        onClick={() => markAsRead(notif.id)}
                      >
                        <p className={`text-sm ${!notif.read ? 'font-medium' : ''}`}>{notif.message}</p>
                        <p className="text-xs text-muted mt-1">
                          {new Date(notif.createdAt).toLocaleString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {totalPages > 1 && (
                  <div className="flex justify-between items-center mt-4 pt-2 border-t border-border">
                    <button 
                      className="text-sm px-2 py-1 rounded-md hover:bg-muted/10 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    <span className="text-xs text-muted">
                      {currentPage} / {totalPages}
                    </span>
                    <button 
                      className="text-sm px-2 py-1 rounded-md hover:bg-muted/10 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;