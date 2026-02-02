'use client';

import { createContext, useContext, ReactNode } from 'react';

interface Master {
  id: string;
  name: string | null;
  username: string;
}

interface MastersContextType {
  masters: Master[];
}

const MastersContext = createContext<MastersContextType | undefined>(undefined);

export function useMasters() {
  const context = useContext(MastersContext);
  if (!context) {
    throw new Error('useMasters must be used within MastersProvider');
  }
  return context;
}

interface MastersProviderProps {
  masters: Master[];
  children?: ReactNode;
}

export function MastersProvider({ masters, children }: MastersProviderProps) {
  return (
    <MastersContext.Provider value={{ masters }}>
      {children}
    </MastersContext.Provider>
  );
}
