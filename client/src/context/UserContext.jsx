/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const DEFAULT_USER = {
    name: "Guest",
    role: "Client",
    avatar: "/default-avatar.png",
  };
  const [user, setUser] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_USER;
    try {
      const storedUser = localStorage.getItem("userData");
      return storedUser ? JSON.parse(storedUser) : DEFAULT_USER;
    } catch {
      // Corrupt data; reset
      localStorage.removeItem("userData");
      return DEFAULT_USER;
    }
  });

  // Keep localStorage in sync
  useEffect(() => {
    localStorage.setItem("userData", JSON.stringify(user));
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
