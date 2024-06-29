'use client';
import { createContext, useState, ReactNode } from 'react';

interface PlayButtonContextProps {
  match: boolean;
  setMatch: (match: boolean) => void;
}

export const PlayButtonContext = createContext<PlayButtonContextProps>({
  match: false,
  setMatch: () => {},
});

export const PlayButtonProvider = ({ children }: { children: ReactNode }) => {
  const [match, setMatch] = useState(false);

  return (
    <PlayButtonContext.Provider value={{ match, setMatch }}>
      {children}
    </PlayButtonContext.Provider>
  );
};
