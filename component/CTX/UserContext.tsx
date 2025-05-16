import {createContext, ReactNode, useContext, useState} from 'react';

interface UserContextProps {
  token: string | null;
  setToken: (token: string | null) => void;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [token, setToken] = useState<string | null>(null);

  return (
    <UserContext.Provider
      value={{
        token,
        setToken,
      }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
