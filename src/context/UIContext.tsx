import React, { createContext, useContext, useState } from 'react';

interface UIContextType {
  isCustomizerOpen: boolean;
  setIsCustomizerOpen: (isOpen: boolean) => void;
  isCommunityOpen: boolean;
  setIsCommunityOpen: (isOpen: boolean) => void;
  isProfileOpen: boolean;
  setIsProfileOpen: (isOpen: boolean) => void;
  isPrivacyOpen: boolean;
  setIsPrivacyOpen: (isOpen: boolean) => void;
  isTermsOpen: boolean;
  setIsTermsOpen: (isOpen: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  return (
    <UIContext.Provider value={{
      isCustomizerOpen,
      setIsCustomizerOpen,
      isCommunityOpen,
      setIsCommunityOpen,
      isProfileOpen,
      setIsProfileOpen,
      isPrivacyOpen,
      setIsPrivacyOpen,
      isTermsOpen,
      setIsTermsOpen,
    }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within a UIProvider');
  return context;
};
