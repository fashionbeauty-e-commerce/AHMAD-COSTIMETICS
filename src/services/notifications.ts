/**
 * Notifications Service - Real MongoDB Backend
 * Uses API endpoints instead of Firebase
 */

import { getAuthToken } from './api';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

export interface Notification {
  _id?: string;
  type: 'order' | 'payment' | 'shipping' | 'promotion' | 'review' | 'message' | 'system' | 'product';
  title: string;
  message: string;
  icon?: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
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
export async function markAllAsRead() {
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

// Notify new product (admin only)
export async function notifyNewProduct(product: {
  id: string;
  name: string;
  price: number;
  brand?: string;
  thumbnail?: string;
  category?: string;
}) {
  const token = getAuthToken();
  if (!token) return false;

  try {
    const response = await fetch(`${BASE_URL}/api/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        type: 'product',
        title: '🆕 New Product Added!',
        message: `${product.brand ? product.brand + ' — ' : ''}${product.name} is now available for $${product.price}`,
        icon: '🛍️',
        link: `/products/${product.id}`,
        data: { productId: product.id, category: product.category }
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Error notifying new product:', error);
    return false;
  }
}

// Notify order update
export async function notifyOrderUpdate(
  userId: string,
  orderId: string,
  status: 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
) {
  const token = getAuthToken();
  if (!token) return false;

  const statusEmoji: Record<string, string> = {
    confirmed: '✅',
    processing: '⚙️',
    shipped: '🚚',
    delivered: '📦',
    cancelled: '❌'
  };

  try {
    const response = await fetch(`${BASE_URL}/api/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        type: 'order',
        title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: `Your order #${orderId.slice(-6).toUpperCase()} has been ${status}`,
        icon: statusEmoji[status] || '📋',
        link: '/account',
        priority: status === 'delivered' ? 'high' : 'medium'
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Error notifying order update:', error);
    return false;
  }
}

// Notify promotion (admin only)
export async function notifyPromotion(
  title: string,
  message: string,
  link?: string
) {
  const token = getAuthToken();
  if (!token) return false;

  try {
    const response = await fetch(`${BASE_URL}/api/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        type: 'promotion',
        title: `🎉 ${title}`,
        message,
        icon: '🎁',
        link: link || '/search',
        priority: 'high'
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Error notifying promotion:', error);
    return false;
  }
}

// Subscribe to user notifications (real-time polling)
export function subscribeToUserNotifications(
  userEmail: string,
  callback: (notifications: Notification[]) => void,
  interval = 5000
) {
  return subscribeToNotifications(callback, interval);
}

// Subscribe to admin notifications
export function subscribeToAdminNotifications(
  callback: (notifications: Notification[]) => void,
  interval = 5000
) {
  return subscribeToNotifications(callback, interval);
}
