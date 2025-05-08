import React, { createContext, useContext, useState, ReactNode } from 'react';

type DrawerContextType = {
  menuVisible: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const DrawerContext = createContext<DrawerContextType>({
  menuVisible: false,
  openDrawer: () => {},
  closeDrawer: () => {},
});

export const useDrawer = () => useContext(DrawerContext);

type DrawerProviderProps = {
  children: ReactNode;
};

export const DrawerProvider = ({ children }: DrawerProviderProps) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const openDrawer = () => setMenuVisible(true);
  const closeDrawer = () => setMenuVisible(false);

  return (
    <DrawerContext.Provider value={{ menuVisible, openDrawer, closeDrawer }}>
      {children}
    </DrawerContext.Provider>
  );
};
