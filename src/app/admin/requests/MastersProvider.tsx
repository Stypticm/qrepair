'use client';

import { createContext, useContext, ReactNode } from 'react';

interface StaffMember {
  id: string;
  name: string | null;
  username: string;
}

interface MastersContextType {
  masters: StaffMember[];
  couriers: StaffMember[];
}

const MastersContext = createContext<MastersContextType | undefined>(undefined);

export function useStaff() {
  const context = useContext(MastersContext);
  if (!context) {
    throw new Error('useStaff must be used within StaffProvider');
  }
  return context;
}

// Keep legacy export for compatibility if needed, but useStaff is preferred
export const useMasters = useStaff;

interface StaffProviderProps {
  masters: StaffMember[];
  couriers: StaffMember[];
  children?: ReactNode;
}

export function MastersProvider({ masters, couriers, children }: StaffProviderProps) {
  return (
    <MastersContext.Provider value={{ masters, couriers }}>
      {children}
    </MastersContext.Provider>
  );
}
