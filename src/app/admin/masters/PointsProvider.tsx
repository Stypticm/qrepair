'use client';

import { createContext, useContext, ReactNode } from 'react';

interface Point {
  id: number;
  address: string;
  workingHours: string;
  name: string;
}

interface PointsContextType {
  points: Point[];
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

export function usePoints() {
  const context = useContext(PointsContext);
  if (!context) {
    throw new Error('usePoints must be used within PointsProvider');
  }
  return context;
}

interface PointsProviderProps {
  points: Point[];
  children: ReactNode;
}

export function PointsProvider({ points, children }: PointsProviderProps) {
  return (
    <PointsContext.Provider value={{ points }}>
      {children}
    </PointsContext.Provider>
  );
}
