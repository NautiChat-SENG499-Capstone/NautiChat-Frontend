"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"


interface User {
  name: string;
  email: string;
  is_admin: boolean;
}


interface AuthContextType {
  isLoggedIn: boolean;
  isGuest: boolean;
  user: User | null; // <-- ADDED
  login: (token: string, guest?: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  // 3. Add state to hold the user object
  const [user, setUser] = useState<User | null>(null); // <-- ADDED

  // 4. Add useEffect to fetch user data when the app loads if a token exists
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        setIsLoggedIn(true);
        setIsGuest(localStorage.getItem("is_guest") === "true");
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            const userData: User = await res.json();
            setUser(userData); // Set the user data
          } else {
            // Token is invalid or expired, so log out
            logout();
          }
        } catch (error) {
          console.error("Failed to fetch user on initial load", error);
          logout(); // Log out on error
        }
      }
    };
    initializeAuth();
  }, []);


  const login = async (token: string, guest = false) => {
    localStorage.setItem("access_token", token);
    localStorage.setItem("is_guest", guest ? "true" : "false");
    setIsLoggedIn(true);
    setIsGuest(guest);

    // 5. Fetch user data after a successful login
    if (!guest) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const userData: User = await res.json();
          setUser(userData); // Set user state
        }
      } catch (error) {
        console.error("Failed to fetch user info after login", error);
      }
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("is_admin");
    localStorage.removeItem("is_guest");
    setIsLoggedIn(false);
    setIsGuest(false);
    setUser(null); // 6. Clear the user state on logout
  };

  // 7. Add 'user' to the context value
  const value = { isLoggedIn, isGuest, user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used inside AuthProvider")
  return context
}