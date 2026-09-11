import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { logout as logoutRequest, refreshAccessToken } from "../lib/auth-api";

export type User = {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  profileImage?: string;
  role?: string;
  [key: string]: unknown;
};

type UserContextValue = {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  login: (userData?: User | null) => Promise<void>;
};

const UserContext = createContext<UserContextValue>({
  user: null,
  loading: true,
  logout: async () => {},
  refreshUser: async () => {},
  login: async () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    try {
      let res = await fetch(`${import.meta.env.VITE_API_URL}/user/profile`, {
        credentials: "include",
      });

      if (res.status === 401) {
        try {
          await refreshAccessToken();
          res = await fetch(`${import.meta.env.VITE_API_URL}/user/profile`, {
            credentials: "include",
          });
        } catch {
          setUser(null);
          return;
        }
      }

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = await res.json();
      setUser(data.user ?? data);
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(userData?: User | null) {
    if (userData) {
      setUser(userData);
      setLoading(false);
      return;
    }

    await refreshUser();
  }

  async function logout() {
    try {
      await logoutRequest();
    } finally {
      setUser(null);
    }
  }

  useEffect(() => {
    void refreshUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, logout, refreshUser, login }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}