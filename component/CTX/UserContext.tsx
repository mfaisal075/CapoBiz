import {createContext, ReactNode, useContext, useState} from 'react';
import BASE_URL from '../BASE_URL';
import axios from 'axios';

interface UserContextProps {
  token: string | null;
  userName: string | '';
  setUserName: (userName: string | '') => void;
  userEmail: string | '';
  setUserEmail: (userEmail: string | '') => void;
  bussName: string | '';
  setBussName: (bussName: string | '') => void;
  bussAddress: string | '';
  setBussAddress: (bussAddress: string | '') => void;
  bussContact: string | '';
  setBussContact: (bussContact: string | '') => void;
  setToken: (token: string | null) => void;
  refreshAddToCart: () => Promise<void>;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [token, setToken] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [bussName, setBussName] = useState('');
  const [bussAddress, setBussAddress] = useState('');
  const [bussContact, setBussContact] = useState('');

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
        userName,
        setUserName,
        userEmail,
        setUserEmail,
        bussName,
        setBussName,
        bussAddress,
        setBussAddress,
        bussContact,
        setBussContact,
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
