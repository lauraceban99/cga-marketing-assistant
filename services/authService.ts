import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'editor' | 'viewer';
  createdAt: Date;
  lastLogin: Date;
}

const auth = getAuth();

// Set persistence to LOCAL (survives browser restarts)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Failed to set auth persistence:', error);
});

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<AppUser> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // Update last login timestamp
    await updateLastLogin(userCredential.user.uid);

    // Get user profile from Firestore
    const appUser = await getUserProfile(userCredential.user.uid);
    return appUser;
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
}

/**
 * Create new user account
 */
export async function signUp(
  email: string,
  password: string,
  displayName: string,
  role: 'admin' | 'editor' | 'viewer' = 'editor'
): Promise<AppUser> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Create user profile in Firestore
    const appUser: AppUser = {
      uid: userCredential.user.uid,
      email,
      displayName,
      role,
      createdAt: new Date(),
      lastLogin: new Date()
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), {
      ...appUser,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    });

    return appUser;
  } catch (error: any) {
    console.error('Sign up error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
}

/**
 * Sign out current user
 */
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw new Error('Failed to sign out. Please try again.');
  }
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<AppUser> {
  const userDoc = await getDoc(doc(db, 'users', uid));

  if (!userDoc.exists()) {
    throw new Error('User profile not found');
  }

  const data = userDoc.data();
  return {
    uid,
    email: data.email,
    displayName: data.displayName,
    role: data.role || 'editor',
    createdAt: data.createdAt?.toDate() || new Date(),
    lastLogin: data.lastLogin?.toDate() || new Date()
  };
}

/**
 * Update user's last login timestamp
 */
async function updateLastLogin(uid: string): Promise<void> {
  try {
    await setDoc(
      doc(db, 'users', uid),
      { lastLogin: serverTimestamp() },
      { merge: true }
    );
  } catch (error) {
    console.error('Failed to update last login:', error);
    // Don't throw - this is not critical
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthChange(callback: (user: AppUser | null) => void): () => void {
  return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      try {
        const appUser = await getUserProfile(firebaseUser.uid);
        callback(appUser);
      } catch (error) {
        console.error('Failed to load user profile:', error);
        callback(null);
      }
    } else {
      callback(null);
    }
  });
}

/**
 * Get current authenticated user
 */
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}

/**
 * Check if user has permission for an action
 */
export function hasPermission(user: AppUser | null, action: 'read' | 'edit' | 'admin'): boolean {
  if (!user) return false;

  const roleHierarchy = {
    viewer: ['read'],
    editor: ['read', 'edit'],
    admin: ['read', 'edit', 'admin']
  };

  return roleHierarchy[user.role].includes(action);
}

/**
 * Convert Firebase Auth error codes to user-friendly messages
 */
function getAuthErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    'auth/invalid-email': 'Invalid email address.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/email-already-in-use': 'An account already exists with this email.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.'
  };

  return errorMessages[errorCode] || 'Authentication failed. Please try again.';
}

export { auth };
