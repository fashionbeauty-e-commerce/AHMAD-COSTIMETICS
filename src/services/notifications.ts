/**
 * Notifications Service - Real MongoDB Backend
 * Uses API endpoints instead of Firebase
 */

import { getAuthToken } from './api';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

export interface Notification {
  _id?: string;
  id?: string;
  type: 'order' | 'payment' | 'shipping' | 'promotion' | 'review' | 'message' | 'system' | 'product';
  title: string;
  message: string;
  icon?: string;
  link?: string;
  image?: string;
  isRead: boolean;
  createdAt: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  data?: Record<string, any>;
}

// Subscribe to admin notifications (same polling for now)
export function subscribeToAdminNotifications(
  callback: (notifications: Notification[]) => void,
  interval = 5000
) {
  return subscribeToNotifications(callback, interval);
}

// Get user notifications
export async function getUserNotifications(page = 1, limit = 20) {
  const token = getAuthToken();
  if (!token) return { notifications: [], total: 0 };

  try {
    const response = await fetch(
      `${BASE_URL}/api/notifications?page=${page}&limit=${limit}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    if (!response.ok) return { notifications: [], total: 0 };
    
    const data = await response.json();
    return {
      notifications: data.data.notifications || [],
      total: data.data.pagination.total || 0,
      pages: data.data.pagination.pages || 1
    };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { notifications: [], total: 0 };
  }
}

// Get unread notification count
export async function getUnreadCount(): Promise<number> {
  const token = getAuthToken();
  if (!token) return 0;

  try {
    const response = await fetch(
      `${BASE_URL}/api/notifications/unread-count`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    if (!response.ok) return 0;
    
    const data = await response.json();
    return data.data.count || 0;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }
}

// Mark notification as read
export async function markAsRead(notificationId: string) {
  const token = getAuthToken();
  if (!token) return false;

  try {
    const response = await fetch(
      `${BASE_URL}/api/notifications/${notificationId}/read`,
      {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    
    return response.ok;
  } catch (error) {
    console.error('Error marking as read:', error);
    return false;
  }
}

// Mark all notifications as read
export async function markAllAsRead(userEmail: string) {
  const token = getAuthToken();
  if (!token) return false;

  try {
    const response = await fetch(
      `${BASE_URL}/api/notifications/read-all`,
      {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    
    return response.ok;
  } catch (error) {
    console.error('Error marking all as read:', error);
    return false;
  }
}

// Delete notification
export async function deleteNotification(notificationId: string) {
  const token = getAuthToken();
  if (!token) return false;

  try {
    const response = await fetch(
      `${BASE_URL}/api/notifications/${notificationId}`,
      {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    
    return response.ok;
  } catch (error) {
    console.error('Error deleting notification:', error);
    return false;
  }
}

// Subscribe to notifications (polling)
export function subscribeToNotifications(
  callback: (notifications: Notification[]) => void,
  interval = 5000
) {
  const poll = async () => {
    const { notifications } = await getUserNotifications(1, 20);
    callback(notifications);
  };

  poll(); // Initial call
  const intervalId = setInterval(poll, interval);

  // Return unsubscribe function
  return () => clearInterval(intervalId);
}

// Subscribe to user notifications (real-time polling)
export function subscribeToUserNotifications(
  userEmail: string,
  callback: (notifications: Notification[]) => void,
  interval = 5000
) {
  return subscribeToNotifications(callback, interval);
}
