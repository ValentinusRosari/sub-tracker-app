"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  token: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
  });

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    // eslint-disable-next-line
    setAuthState({
      user: token ? { token } : null,
      loading: false,
    });
  }, []);

  const login = (token: string) => {
    localStorage.setItem("token", token);
    setAuthState({ user: { token }, loading: false });
    router.push("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuthState({ user: null, loading: false });
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
