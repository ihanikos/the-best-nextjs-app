"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserRole } from "./roles";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
  updateUserRole: (userId: string, newRole: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "nexus_auth";
const USERS_STORAGE_KEY = "nexus_users";

// Demo users for testing with different roles
const DEMO_USERS: User[] = [
  {
    id: "1",
    email: "admin@nexus.dev",
    name: "Admin User",
    avatar: "https://github.com/shadcn.png",
    role: "admin",
  },
  {
    id: "2",
    email: "manager@nexus.dev",
    name: "Manager User",
    role: "manager",
  },
  {
    id: "3",
    email: "member@nexus.dev",
    name: "Team Member",
    role: "member",
  },
  {
    id: "4",
    email: "viewer@nexus.dev",
    name: "Viewer User",
    role: "viewer",
  },
];

const DEMO_PASSWORD = "password123";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(DEMO_USERS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing auth on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    
    if (storedUsers) {
      try {
        const parsed = JSON.parse(storedUsers);
        setUsers(parsed);
      } catch {
        localStorage.removeItem(USERS_STORAGE_KEY);
      }
    }
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.user) {
          setUser(parsed.user);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  // Persist users when they change
  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Demo authentication with role-based users
    const foundUser = users.find((u) => u.email === email);
    
    if (foundUser && password === DEMO_PASSWORD) {
      setUser(foundUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: foundUser }));
    } else {
      setError("Invalid email or password");
      throw new Error("Invalid credentials");
    }

    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const clearError = () => {
    setError(null);
  };

  const updateUserRole = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    
    // If updating current user, update them too
    if (user && user.id === userId) {
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: updatedUser }));
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    error,
    clearError,
    updateUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Hook to get all users (for admin/manager role management)
export function useUsers(): User[] {
  const [users, setUsers] = useState<User[]>(DEMO_USERS);
  
  useEffect(() => {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (stored) {
      try {
        setUsers(JSON.parse(stored));
      } catch {
        // Keep default users
      }
    }
  }, []);
  
  return users;
}
