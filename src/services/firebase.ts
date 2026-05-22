import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where, orderBy, serverTimestamp, getDocs } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { CONFIG } from "../config";

const firebaseConfig = {
  apiKey: CONFIG.FIREBASE.API_KEY,
  authDomain: CONFIG.FIREBASE.AUTH_DOMAIN,
  projectId: CONFIG.FIREBASE.PROJECT_ID,
  storageBucket: CONFIG.FIREBASE.STORAGE_BUCKET,
  messagingSenderId: CONFIG.FIREBASE.MESSAGING_SENDER_ID,
  appId: CONFIG.FIREBASE.APP_ID,
  measurementId: CONFIG.FIREBASE.MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Collections
const PRODUCTS_COLLECTION = "products";
const ORDERS_COLLECTION = "orders";
const MESSAGES_COLLECTION = "messages";
const CHAT_ROOMS_COLLECTION = "chatRooms";

// Product Operations
export const subscribeToProducts = (callback: (products: any[]) => void) => {
  const q = query(collection(db, PRODUCTS_COLLECTION), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(products);
  });
};

// Order Operations
export const createOrder = async (order: any) => {
  try {
    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
      ...order,
      status: "pending",
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

export const subscribeToOrders = (userId: string, callback: (orders: any[]) => void) => {
  const q = query(
    collection(db, ORDERS_COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(orders);
  });
};

// Chat Operations
export const createChatRoom = async (userId: string, adminId: string) => {
  try {
    const q = query(
      collection(db, CHAT_ROOMS_COLLECTION),
      where("participants", "array-contains", userId)
    );
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const existingRoom = snapshot.docs.find(doc => 
        doc.data().participants.includes(adminId)
      );
      if (existingRoom) {
        return existingRoom.id;
      }
    }

    const docRef = await addDoc(collection(db, CHAT_ROOMS_COLLECTION), {
      participants: [userId, adminId],
      createdAt: serverTimestamp(),
      lastMessage: "",
      lastMessageAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating chat room:", error);
    throw error;
  }
};

export const sendMessage = async (roomId: string, senderId: string, text: string) => {
  try {
    await addDoc(collection(db, MESSAGES_COLLECTION), {
      roomId,
      senderId,
      text,
      createdAt: serverTimestamp(),
      read: false,
    });

    await updateDoc(doc(db, CHAT_ROOMS_COLLECTION, roomId), {
      lastMessage: text,
      lastMessageAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export const subscribeToMessages = (roomId: string, callback: (messages: any[]) => void) => {
  const q = query(
    collection(db, MESSAGES_COLLECTION),
    where("roomId", "==", roomId),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(messages);
  });
};

export const subscribeToChatRooms = (userId: string, callback: (rooms: any[]) => void) => {
  const q = query(
    collection(db, CHAT_ROOMS_COLLECTION),
    where("participants", "array-contains", userId),
    orderBy("lastMessageAt", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const rooms = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(rooms);
  });
};

// Mark messages as read
export const markMessagesAsRead = async (roomId: string, userId: string) => {
  try {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where("roomId", "==", roomId),
      where("read", "==", false)
    );
    const snapshot = await getDocs(q);
    const updates = snapshot.docs
      .filter(doc => doc.data().senderId !== userId)
      .map(doc => updateDoc(doc.ref, { read: true }));
    await Promise.all(updates);
  } catch (error) {
    console.error("Error marking messages as read:", error);
  }
};

// Get unread count for a room
export const getUnreadCount = async (roomId: string, userId: string): Promise<number> => {
  try {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where("roomId", "==", roomId),
      where("read", "==", false)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.filter(doc => doc.data().senderId !== userId).length;
  } catch (error) {
    return 0;
  }
};

// Auth Operations
export const signInWithFirebase = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

export const signOutFirebase = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export const onAuthChange = (callback: (user: any) => void) => {
  return onAuthStateChanged(auth, callback);
};
