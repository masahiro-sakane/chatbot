import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  orderBy,
  getDocs,
  deleteDoc,
  type Firestore,
  Timestamp,
} from 'firebase/firestore';
import type { Message } from '../types';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

/**
 * Initialize Firebase
 */
export function initializeFirebase() {
  if (app) {
    return;
  }

  // Firebase configuration from environment variables
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  // Check if Firebase is configured
  if (!firebaseConfig.projectId) {
    console.warn('Firebase not configured - conversation persistence disabled');
    return;
  }

  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
  }
}

/**
 * Check if Firebase is initialized
 */
export function isFirebaseEnabled(): boolean {
  return db !== null;
}

/**
 * Save conversation to Firestore
 */
export async function saveConversation(
  userId: string,
  conversationId: string,
  messages: Message[]
): Promise<void> {
  if (!db) {
    console.warn('Firebase not initialized, skipping conversation save');
    return;
  }

  try {
    const conversationRef = doc(db, 'conversations', `${userId}_${conversationId}`);
    await setDoc(conversationRef, {
      userId,
      conversationId,
      messages,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Failed to save conversation:', error);
    throw error;
  }
}

/**
 * Get conversation from Firestore
 */
export async function getConversation(
  userId: string,
  conversationId: string
): Promise<Message[]> {
  if (!db) {
    return [];
  }

  try {
    const conversationRef = doc(db, 'conversations', `${userId}_${conversationId}`);
    const conversationDoc = await getDoc(conversationRef);

    if (!conversationDoc.exists()) {
      return [];
    }

    const data = conversationDoc.data();
    return data.messages || [];
  } catch (error) {
    console.error('Failed to get conversation:', error);
    return [];
  }
}

/**
 * List all conversations for a user
 */
export async function listConversations(userId: string): Promise<
  Array<{
    conversationId: string;
    messageCount: number;
    updatedAt: Date | null;
  }>
> {
  if (!db) {
    return [];
  }

  try {
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        conversationId: data.conversationId,
        messageCount: data.messages?.length || 0,
        updatedAt: data.updatedAt?.toDate() || null,
      };
    });
  } catch (error) {
    console.error('Failed to list conversations:', error);
    return [];
  }
}

/**
 * Delete a conversation
 */
export async function deleteConversation(
  userId: string,
  conversationId: string
): Promise<void> {
  if (!db) {
    return;
  }

  try {
    const conversationRef = doc(db, 'conversations', `${userId}_${conversationId}`);
    await deleteDoc(conversationRef);
  } catch (error) {
    console.error('Failed to delete conversation:', error);
    throw error;
  }
}

// Initialize Firebase when the module is loaded
initializeFirebase();
