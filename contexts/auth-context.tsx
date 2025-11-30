"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type UserRole = "operator" | "auditor" | "admin" | "developer";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  casino?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in (from localStorage or session)
    const storedUser = localStorage.getItem("casinoUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API call
    // In a real app, you would validate credentials with a backend
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          // Mock user based on email domain
          let role: UserRole = "operator";
          let casino: string | undefined = "Default Casino";

          if (email.includes("@admin")) {
            role = "admin";
            casino = undefined;
          } else if (email.includes("@audit")) {
            role = "auditor";
            casino = undefined;
          } else if (email.includes("@dev")) {
            role = "developer";
            casino = undefined;
          }

          const mockUser: User = {
            id: "user_" + Math.random().toString(36).substr(2, 9),
            name: email.split("@")[0],
            email,
            role,
            casino,
          };

          setUser(mockUser);
          setIsAuthenticated(true);
          localStorage.setItem("casinoUser", JSON.stringify(mockUser));
          resolve();
        } else {
          reject(new Error("Invalid credentials"));
        }
      }, 500);
    });
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("casinoUser");
  };

  const hasRole = (role: UserRole) => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]) => {
    return user ? roles.includes(user.role) : false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated,
        hasRole,
        hasAnyRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
