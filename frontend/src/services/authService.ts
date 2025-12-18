import {
  getAuth,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
  type Auth,
} from 'firebase/auth';
import { initializeFirebase } from './firebaseService';

let auth: Auth | null = null;

/**
 * Initialize Firebase Auth
 */
export function initializeAuth(): Auth | null {
  if (auth) {
    return auth;
  }

  // Make sure Firebase is initialized first
  initializeFirebase();

  try {
    auth = getAuth();
    return auth;
  } catch (error) {
    console.error('Failed to initialize Firebase Auth:', error);
    return null;
  }
}

/**
 * Sign in anonymously
 */
export async function signInAnonymous(): Promise<User | null> {
  const authInstance = initializeAuth();
  if (!authInstance) {
    throw new Error('Firebase Auth not initialized');
  }

  try {
    const userCredential = await signInAnonymously(authInstance);
    return userCredential.user;
  } catch (error) {
    console.error('Anonymous sign in failed:', error);
    throw error;
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<User | null> {
  const authInstance = initializeAuth();
  if (!authInstance) {
    throw new Error('Firebase Auth not initialized');
  }

  try {
    const userCredential = await signInWithEmailAndPassword(authInstance, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Sign in failed:', error);
    throw error;
  }
}

/**
 * Create a new user with email and password
 */
export async function signUp(email: string, password: string): Promise<User | null> {
  const authInstance = initializeAuth();
  if (!authInstance) {
    throw new Error('Firebase Auth not initialized');
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Sign up failed:', error);
    throw error;
  }
}

/**
 * Sign out the current user
 */
export async function logout(): Promise<void> {
  const authInstance = initializeAuth();
  if (!authInstance) {
    throw new Error('Firebase Auth not initialized');
  }

  try {
    await signOut(authInstance);
  } catch (error) {
    console.error('Sign out failed:', error);
    throw error;
  }
}

/**
 * Get the current user
 */
export function getCurrentUser(): User | null {
  const authInstance = initializeAuth();
  return authInstance?.currentUser || null;
}

/**
 * Subscribe to auth state changes
 */
export function onAuthChange(callback: (user: User | null) => void): (() => void) | null {
  const authInstance = initializeAuth();
  if (!authInstance) {
    return null;
  }

  return onAuthStateChanged(authInstance, callback);
}
