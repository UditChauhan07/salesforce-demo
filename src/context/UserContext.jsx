import { useState, useEffect, createContext, useContext } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [isUserLoading, setIsUserLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setIsUserLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const fetched = localStorage.getItem("Api Data");
    if (fetched?.length) {
      setUser(JSON.parse(fetched));
    }
  }, []);
  const setUserValue = (value) => {
    setUser(value);
  };
  return (
    <UserContext.Provider
      value={{
        user,
        isUserLoading,
        setUserValue,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useAuth = () => useContext(UserContext);
