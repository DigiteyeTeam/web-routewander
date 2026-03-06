"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const MOCK_AUTH_KEY = "route-wander-mock-user";

export type MockUser = {
  email: string;
  image: string | null;
};

type MockAuthContextValue = {
  user: MockUser | null;
  signInMock: () => void;
  signOut: () => void;
  isMock: true;
};

const MockAuthContext = createContext<MockAuthContextValue | null>(null);

function loadMockUser(): MockUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(MOCK_AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.email) return parsed;
    return null;
  } catch {
    return null;
  }
}

function saveMockUser(user: MockUser | null) {
  if (typeof window === "undefined") return;
  try {
    if (user) localStorage.setItem(MOCK_AUTH_KEY, JSON.stringify(user));
    else localStorage.removeItem(MOCK_AUTH_KEY);
  } catch {}
}

const MOCK_GOOGLE_USER: MockUser = {
  email: "demo@gmail.com",
  image: null,
};

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setUser(loadMockUser());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveMockUser(user);
  }, [user, hydrated]);

  const signInMock = useCallback(() => {
    setUser(MOCK_GOOGLE_USER);
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, signInMock, signOut, isMock: true as const }),
    [user, signInMock, signOut]
  );

  return (
    <MockAuthContext.Provider value={value}>{children}</MockAuthContext.Provider>
  );
}

export function useMockAuth() {
  const ctx = useContext(MockAuthContext);
  if (!ctx) throw new Error("useMockAuth must be used within MockAuthProvider");
  return ctx;
}
