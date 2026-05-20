/**
 * Cart & Wishlist Store - Real MongoDB Backend
 * Syncs with MongoDB via API for authenticated users
 */

import { getAuthToken } from './api';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

// ============ CART ============

const CART_KEY = 'ahmad_cart';

export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveCart(items: any[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('cart-updated', { detail: items }));
}

export function addToCart(product: any) {
  const cart = getCart();
  const existing = cart.find(i => i.id === product.id && i.size === product.size && i.color === product.color);

  if (existing) {
    existing.quantity += product.quantity || 1;
  } else {
    cart.push({ ...product, quantity: product.quantity || 1 });
  }

  saveCart(cart);
  syncCartToMongoDB(cart);
  return cart;
}

export function removeFromCart(id: string) {
  const cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
  syncCartToMongoDB(cart);
  return cart;
}

export function updateCartQuantity(id: string, quantity: number) {
  const cart = getCart().map(i => i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i);
  saveCart(cart);
  syncCartToMongoDB(cart);
  return cart;
}

export function clearCart() {
  saveCart([]);
  syncCartToMongoDB([]);
}

export function getCartCount(): number {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartTotal(): number {
  return getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// Sync cart to MongoDB for authenticated user
async function syncCartToMongoDB(cart: any[]) {
  const token = getAuthToken();
  if (!token) return;

  try {
    // Load cart from backend first
    const response = await fetch(`${BASE_URL}/api/users/cart`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) return;

    const data = await response.json();
    const backendCart = data.data.cart || [];

    // Sync local cart to backend
    for (const item of cart) {
      const existingItem = backendCart.find(
        b => b.product === item.id && b.size === item.size && b.color === item.color
      );

      if (!existingItem) {
        await fetch(`${BASE_URL}/api/users/cart/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            productId: item.id,
            quantity: item.quantity,
            size: item.size,
            color: item.color
          })
        });
      }
    }
  } catch (error) {
    console.error('Cart sync error:', error);
  }
}

// Load cart from MongoDB
export async function loadCartFromMongoDB() {
  const token = getAuthToken();
  if (!token) return;

  try {
    const response = await fetch(`${BASE_URL}/api/users/cart`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) return;

    const data = await response.json();
    const backendCart = data.data.cart || [];

    // Convert to local format and save
    const localCart = backendCart.map((item: any) => ({
      id: item.product._id || item.product,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      thumbnail: item.product.thumbnail
    }));

    if (localCart.length > 0) {
      saveCart(localCart);
    }
  } catch (error) {
    console.error('Cart load error:', error);
  }
}

// ============ WISHLIST ============

const WISHLIST_KEY = 'ahmad_wishlist';

export function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveWishlist(items: any[]) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: items }));
}

export function addToWishlist(product: any) {
  const list = getWishlist();
  if (!list.find(i => i.id === product.id)) {
    list.push(product);
    saveWishlist(list);
    syncWishlistToMongoDB(list);
  }
  return list;
}

export function removeFromWishlist(id: string) {
  const list = getWishlist().filter(i => i.id !== id);
  saveWishlist(list);
  syncWishlistToMongoDB(list);
  return list;
}

export function isInWishlist(id: string): boolean {
  return getWishlist().some(i => i.id === id);
}

export function getWishlistCount(): number {
  return getWishlist().length;
}

// Sync wishlist to MongoDB
async function syncWishlistToMongoDB(list: any[]) {
  const token = getAuthToken();
  if (!token) return;

  try {
    for (const item of list) {
      await fetch(`${BASE_URL}/api/users/wishlist/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId: item.id })
      });
    }
  } catch (error) {
    console.error('Wishlist sync error:', error);
  }
}

// Load wishlist from MongoDB
export async function loadWishlistFromMongoDB() {
  const token = getAuthToken();
  if (!token) return;

  try {
    const response = await fetch(`${BASE_URL}/api/users/wishlist`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) return;

    const data = await response.json();
    const backendWishlist = data.data.wishlist || [];

    const localWishlist = backendWishlist.map((product: any) => ({
      id: product._id,
      name: product.name,
      price: product.price,
      thumbnail: product.thumbnail,
      category: product.category
    }));

    if (localWishlist.length > 0) {
      saveWishlist(localWishlist);
    }
  } catch (error) {
    console.error('Wishlist load error:', error);
  }
}

