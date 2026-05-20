/**
 * Admin Authentication & Management Service
 * Uses real MongoDB backend instead of Firebase
 */

import { getAuthToken } from './api';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

// PRIMARY/SUPER ADMIN EMAILS - hardcoded for security
export const SUPER_ADMIN_EMAILS = [
  'fashionbeauty101f@gmail.com',
  'konkcee@gmail.com',
];

export interface AdminUser {
  id?: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'manager';
  permissions: string[];
  isActive: boolean;
  lastLogin?: string;
  avatar?: string;
}

/**
 * Check if email is a super admin (hardcoded)
 */
export function isSuperAdmin(email: string): boolean {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

/**
 * Check if email has admin access
 */
export async function hasAdminAccess(email: string): Promise<boolean> {
  if (!email) return false;

  const normalizedEmail = email.toLowerCase().trim();

  // Check super admin first (instant, no DB call)
  if (SUPER_ADMIN_EMAILS.includes(normalizedEmail)) {
    return true;
  }

  // Check if added as admin in MongoDB via API
  try {
    const token = getAuthToken();
    const response = await fetch(`${BASE_URL}/api/admin/users?email=${normalizedEmail}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });

    if (!response.ok) return false;

    const data = await response.json();
    return data.data?.isActive === true;
  } catch (error) {
    console.error('Error checking admin access:', error);
    return false;
  }
}

/**
 * Get admin user details
 */
export async function getAdminDetails(email: string): Promise<AdminUser | null> {
  const normalizedEmail = email.toLowerCase().trim();

  // Super admin response
  if (SUPER_ADMIN_EMAILS.includes(normalizedEmail)) {
    return {
      email: normalizedEmail,
      name: 'Super Administrator',
      role: 'super_admin',
      permissions: ['*'],
      isActive: true,
    };
  }

  try {
    const token = getAuthToken();
    const response = await fetch(`${BASE_URL}/api/admin/users?email=${normalizedEmail}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.data || null;
  } catch (error) {
    console.error('Error getting admin details:', error);
    return null;
  }
}

/**
 * Add a new admin (only super admins can do this)
 */
export async function addAdmin(
  newAdminEmail: string,
  name: string,
  role: 'admin' | 'manager',
  permissions: string[],
  addedByEmail: string
): Promise<{ success: boolean; message: string }> {
  if (!SUPER_ADMIN_EMAILS.includes(addedByEmail.toLowerCase())) {
    return { success: false, message: 'Only super admins can add new admins' };
  }

  const normalizedEmail = newAdminEmail.toLowerCase().trim();

  if (SUPER_ADMIN_EMAILS.includes(normalizedEmail)) {
    return { success: false, message: 'This email is already a super admin' };
  }

  try {
    const token = getAuthToken();
    const response = await fetch(`${BASE_URL}/api/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        email: normalizedEmail,
        name,
        role,
        permissions,
        isActive: true
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message || 'Failed to add admin' };
    }

    return { success: true, message: 'Admin added successfully' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to add admin' };
  }
}

/**
 * Remove an admin (only super admins can do this)
 */
export async function removeAdmin(
  adminEmail: string,
  removedByEmail: string
): Promise<{ success: boolean; message: string }> {
  if (!SUPER_ADMIN_EMAILS.includes(removedByEmail.toLowerCase())) {
    return { success: false, message: 'Only super admins can remove admins' };
  }

  const normalizedEmail = adminEmail.toLowerCase().trim();

  if (SUPER_ADMIN_EMAILS.includes(normalizedEmail)) {
    return { success: false, message: 'Cannot remove super admin' };
  }

  try {
    const token = getAuthToken();
    const response = await fetch(`${BASE_URL}/api/admin/users/${normalizedEmail}`, {
      method: 'DELETE',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message || 'Failed to remove admin' };
    }

    return { success: true, message: 'Admin removed successfully' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to remove admin' };
  }
}

/**
 * Update admin status (activate/deactivate)
 */
export async function toggleAdminStatus(
  adminEmail: string,
  isActive: boolean,
  updatedByEmail: string
): Promise<{ success: boolean; message: string }> {
  if (!SUPER_ADMIN_EMAILS.includes(updatedByEmail.toLowerCase())) {
    return { success: false, message: 'Only super admins can update admin status' };
  }

  const normalizedEmail = adminEmail.toLowerCase().trim();

  if (SUPER_ADMIN_EMAILS.includes(normalizedEmail)) {
    return { success: false, message: 'Cannot deactivate super admin' };
  }

  try {
    const token = getAuthToken();
    const response = await fetch(`${BASE_URL}/api/admin/users/${normalizedEmail}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ isActive })
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message || 'Failed to update admin status' };
    }

    return { success: true, message: `Admin ${isActive ? 'activated' : 'deactivated'}` };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to update admin' };
  }
}

/**
 * Get all admins
 */
export async function getAllAdmins(): Promise<AdminUser[]> {
  const admins: AdminUser[] = [];

  // Add super admins
  SUPER_ADMIN_EMAILS.forEach(email => {
    admins.push({
      email,
      name: 'Super Administrator',
      role: 'super_admin',
      permissions: ['*'],
      isActive: true,
    });
  });

  try {
    const token = getAuthToken();
    const response = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });

    if (!response.ok) return admins;

    const data = await response.json();
    const dbAdmins = data.data || [];

    return [...admins, ...dbAdmins];
  } catch (error) {
    console.error('Error getting admins:', error);
    return admins;
  }
}

/**
 * Subscribe to admins list
 */
export function subscribeToAdmins(callback: (admins: AdminUser[]) => void) {
  const poll = async () => {
    const admins = await getAllAdmins();
    callback(admins);
  };

  poll();
  const intervalId = setInterval(poll, 5000);

  return () => clearInterval(intervalId);
}

/**
 * Update last login timestamp
 */
export async function updateLastLogin(email: string): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();

  // Skip for super admins
  if (SUPER_ADMIN_EMAILS.includes(normalizedEmail)) {
    return;
  }

  try {
    const token = getAuthToken();
    if (!token) return;

    await fetch(`${BASE_URL}/api/admin/users/${normalizedEmail}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ lastLogin: new Date().toISOString() })
    });
  } catch (error) {
    console.error('Error updating last login:', error);
  }
}

/**
 * Available permissions list
 */
export const AVAILABLE_PERMISSIONS = [
  { id: 'orders.view', label: 'View Orders', category: 'Orders' },
  { id: 'orders.approve', label: 'Approve Payments', category: 'Orders' },
  { id: 'orders.update', label: 'Update Orders', category: 'Orders' },
  { id: 'products.view', label: 'View Products', category: 'Products' },
  { id: 'products.create', label: 'Create Products', category: 'Products' },
  { id: 'products.update', label: 'Update Products', category: 'Products' },
  { id: 'products.delete', label: 'Delete Products', category: 'Products' },
  { id: 'categories.manage', label: 'Manage Categories', category: 'Catalog' },
  { id: 'customers.view', label: 'View Customers', category: 'Customers' },
  { id: 'customers.manage', label: 'Manage Customers', category: 'Customers' },
  { id: 'chat.view', label: 'View Customer Chat', category: 'Communication' },
  { id: 'chat.respond', label: 'Respond to Chat', category: 'Communication' },
  { id: 'admins.manage', label: 'Manage Admins', category: 'System' },
  { id: 'settings.manage', label: 'Manage Settings', category: 'System' },
  { id: 'analytics.view', label: 'View Analytics', category: 'Reports' },
];
