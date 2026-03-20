import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

export type CurrentUser = {
  userId: string;
  displayName: string;
};

type AuthContextValue = {
  currentUser: CurrentUser;
  setCurrentUser: (nextUser: CurrentUser) => void;
};

const STORAGE_KEY = 'book-app-current-user';
const DEFAULT_USER: CurrentUser = {
  userId: 'demo-user',
  displayName: 'Demo User',
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [currentUser, setCurrentUserState] = useState<CurrentUser>(() => {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    if (!storedValue) {
      return DEFAULT_USER;
    }

    try {
      return JSON.parse(storedValue) as CurrentUser;
    } catch {
      return DEFAULT_USER;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
  }, [currentUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      setCurrentUser: (nextUser) => setCurrentUserState(nextUser),
    }),
    [currentUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }
  return context;
}

