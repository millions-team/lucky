'use client';

import { createContext, useContext, useMemo } from 'react';
import { Crypto } from '@/utils';

const Context = createContext<Crypto>(new Crypto());

export function CryptoProvider({ children }: { children: React.ReactNode }) {
  // TODO: Load key from session storage.
  const key = undefined;
  const crypto = useMemo(() => new Crypto(key), [key]);

  return <Context.Provider value={crypto}>{children}</Context.Provider>;
}

export function useCrypto() {
  return useContext(Context);
}
