/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("userData");
    return storedUser
      ? JSON.parse(storedUser)
      : { name: "Guest", role: "Client", avatar: "/default-avatar.png" };
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
