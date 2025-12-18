import admin from 'firebase-admin';
import { Message } from '../types';

let isInitialized = false;

/**
 * Initialize Firebase Admin SDK
 */
export function initializeFirebase() {
  if (isInitialized) {
    return;
  }

  try {
    // In production, use service account key
    // For development, you can use default credentials or emulator
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else if (process.env.FIREBASE_EMULATOR_HOST) {
      // Use Firebase Emulator for local development
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project',
      });
      console.log('Using Firebase Emulator');
    } else {
      console.warn('Firebase not configured - conversation persistence disabled');
      return;
    }

    isInitialized = true;
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
  }
}

/**
 * Get Firestore instance
 */
export function getFirestore() {
  if (!isInitialized) {
    initializeFirebase();
  }
  return admin.firestore();
}

/**
 * Save conversation to Firestore
 */
export async function saveConversation(
  userId: string,
  conversationId: string,
  messages: Message[]
): Promise<void> {
  if (!isInitialized) {
    console.warn('Firebase not initialized, skipping conversation save');
    return;
  }

  try {
    const db = getFirestore();
    await db.collection('conversations').doc(`${userId}_${conversationId}`).set({
      userId,
      conversationId,
      messages,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
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
  if (!isInitialized) {
    console.warn('Firebase not initialized, returning empty conversation');
    return [];
  }

  try {
    const db = getFirestore();
    const doc = await db.collection('conversations').doc(`${userId}_${conversationId}`).get();

    if (!doc.exists) {
      return [];
    }

    const data = doc.data();
    return data?.messages || [];
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
  if (!isInitialized) {
    return [];
  }

  try {
    const db = getFirestore();
    const snapshot = await db
      .collection('conversations')
      .where('userId', '==', userId)
      .orderBy('updatedAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => {
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
  if (!isInitialized) {
    return;
  }

  try {
    const db = getFirestore();
    await db.collection('conversations').doc(`${userId}_${conversationId}`).delete();
  } catch (error) {
    console.error('Failed to delete conversation:', error);
    throw error;
  }
}
