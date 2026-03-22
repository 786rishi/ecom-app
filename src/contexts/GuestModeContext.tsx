import React, { createContext, useContext, ReactNode } from 'react';

interface GuestModeContextType {
  isGuestMode: boolean;
  setIsGuestMode: (isGuest: boolean) => void;
}

const GuestModeContext = createContext<GuestModeContextType | undefined>(undefined);

export const GuestModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isGuestMode, setIsGuestMode] = React.useState(false);

  return (
    <GuestModeContext.Provider value={{ isGuestMode, setIsGuestMode }}>
      {children}
    </GuestModeContext.Provider>
  );
};

export const useGuestMode = () => {
  const context = useContext(GuestModeContext);
  if (context === undefined) {
    throw new Error('useGuestMode must be used within a GuestModeProvider');
  }
  return context;
};
