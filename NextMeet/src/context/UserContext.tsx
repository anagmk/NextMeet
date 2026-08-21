import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { logout as logoutRequest } from "../lib/auth-api";

export type User = {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  [key: string]: unknown;
};

type UserContextValue = {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
};

const UserContext = createContext<UserContextValue>({
  user: null,
  loading: true,
  logout: async () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function logout() {
    try {
      await logoutRequest();
    } finally {
      setUser(null);
    }
  }

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/user/profile`, {
          credentials: "include",
        });

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

    fetchProfile();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}