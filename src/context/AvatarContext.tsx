// src/context/AvatarContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";

interface AvatarContextType {
  avatarUrl: string;
  setAvatarUrl: (url: string) => void;
}

const AvatarContext = createContext<AvatarContextType | null>(null);

const COOKIE_NAME = "user_avatar";

const getCookie = (name: string) => {
  const match = document.cookie.split("; ").find((c) => c.startsWith(name + "="));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
};

const setCookie = (name: string, value: string, days = 365) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/`;
};

export const AvatarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // default avatar — change to whatever default path you prefer
  const DEFAULT = "/avatar.jpeg";

  const [avatarUrl, setAvatarUrlState] = useState<string>(DEFAULT);

  useEffect(() => {
    // read cookie on mount
    const saved = getCookie(COOKIE_NAME);
    if (saved) setAvatarUrlState(saved);
  }, []);

  const setAvatarUrl = (url: string) => {
    setAvatarUrlState(url);
    setCookie(COOKIE_NAME, url, 365);
  };

  return (
    <AvatarContext.Provider value={{ avatarUrl, setAvatarUrl }}>
      {children}
    </AvatarContext.Provider>
  );
};

export const useAvatar = () => {
  const ctx = useContext(AvatarContext);
  if (!ctx) throw new Error("useAvatar must be used inside AvatarProvider");
  return ctx;
};
