import React, { createContext, useContext, useState, ReactNode } from "react";

interface SidebarContextType {
  isCondensed: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

interface SidebarProviderProps {
  children: ReactNode;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({
  children,
}) => {
  const [isCondensed, setIsCondensed] = useState(false);

  const toggleSidebar = () => {
    setIsCondensed((prev) => !prev);
  };

  return (
    <SidebarContext.Provider value={{ isCondensed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};
