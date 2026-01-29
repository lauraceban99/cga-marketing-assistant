import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthChange, signIn, signUp, signOutUser, hasPermission, type AppUser } from '../services/authService';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AppUser>;
  signUp: (email: string, password: string, displayName: string, role?: 'admin' | 'editor' | 'viewer') => Promise<AppUser>;
  signOut: () => Promise<void>;
  hasPermission: (action: 'read' | 'edit' | 'admin') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      setLoading(false);

      if (user) {
        console.log(`✅ Signed in as ${user.displayName} (${user.role})`);
      } else {
        console.log('👤 Not signed in');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async (email: string, password: string): Promise<AppUser> => {
    setLoading(true);
    try {
      const user = await signIn(email, password);
      return user;
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (
    email: string,
    password: string,
    displayName: string,
    role: 'admin' | 'editor' | 'viewer' = 'editor'
  ): Promise<AppUser> => {
    setLoading(true);
    try {
      const user = await signUp(email, password, displayName, role);
      return user;
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async (): Promise<void> => {
    setLoading(true);
    try {
      await signOutUser();
    } finally {
      setLoading(false);
    }
  };

  const checkPermission = (action: 'read' | 'edit' | 'admin'): boolean => {
    return hasPermission(user, action);
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    hasPermission: checkPermission
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
