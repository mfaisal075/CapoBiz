import {createContext, ReactNode, useContext, useState} from 'react';
import BASE_URL from '../BASE_URL';
import axios from 'axios';

interface UserContextProps {
  token: string | null;
  setToken: (token: string | null) => void;
  refreshAddToCart: () => Promise<void>;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [token, setToken] = useState<string | null>(null);

  const refreshAddToCart = async () => {
    if (!token) return;

    try {
      await axios.get(`${BASE_URL}/loadpurchaseordercart`, {
        headers: {Authorization: `Bearer ${token}`},
      });
    } catch (error) {
      console.error('Clear cart error:', error);
    }
  };

  return (
    <UserContext.Provider
      value={{
        token,
        setToken,
        refreshAddToCart,
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
