'use client';

import {
  type PropsWithChildren,
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { PublicKey } from '@solana/web3.js';
import { atomWithStorage } from 'jotai/utils';
import { atom } from 'jotai/index';
import { useAtomValue, useSetAtom } from 'jotai';

import type {
  BagKey,
  LuckyBag,
  LuckyBags,
  LuckyBagProviderContext,
} from '@/adapters';
import { useCrypto } from '@/providers/crypto-provider';
import { decryptBag, encryptBag, getKey } from '@/utils';

const defaultBags = {} as LuckyBags;
const bagsAtom = atomWithStorage<LuckyBags>('elb', defaultBags, undefined, {
  getOnInit: true,
});
const bagAtom = atomWithStorage<BagKey | null>('elb-active', null, undefined, {
  getOnInit: true,
});

const availableBagsAtom = atom<LuckyBags>((get) => get(bagsAtom));
const activeBagAtom = atom<BagKey | null>((get) => get(bagAtom));

const Context = createContext<LuckyBagProviderContext>(
  {} as LuckyBagProviderContext
);

export function LuckyBagsProvider({ children }: PropsWithChildren) {
  const crypto = useCrypto();
  const bags = useAtomValue(availableBagsAtom);
  const active = useAtomValue(activeBagAtom);
  const setBags = useSetAtom(bagsAtom);
  const setActive = useSetAtom(bagAtom);

  const getBag = useCallback(
    (luckyKey: PublicKey | string) => {
      const bag = bags[getKey(luckyKey)];
      if (!bag) throw new Error('Bag does not exist');

      return decryptBag(bag, crypto);
    },
    [bags, crypto]
  );

  const [bag, setBag] = useState(active ? getBag(active) : null);

  useEffect(() => {
    if (!active && (!bag || bag.kp.publicKey.toString() !== active)) return;
    const id = setTimeout(() => {
      setBag(getBag(active));
    });

    return () => clearTimeout(id);
  }, [active]);

  const openBag = useCallback(
    (luckyKey?: PublicKey | string) => {
      const key = luckyKey ? getKey(luckyKey) : active;
      if (!key || !bags[key]) return null;

      setActive(key);
      return getBag(key);
    },
    [active, bags, getBag]
  );

  const addBag = useCallback(
    (bag: LuckyBag) => {
      const key = getKey(bag.kp.publicKey);
      if (bags[key]) return bag;

      setBag(bag);
      setActive(key);
      setBags((prev) => ({ ...prev, [key]: encryptBag(bag, crypto) }));

      return bag;
    },
    [bags, crypto]
  );

  const deleteBag = useCallback(
    (luckyKey: PublicKey | string) => {
      const key = getKey(luckyKey);
      if (!bags[key]) return false;

      if (key === active) {
        setBag(null);
        setActive(null);
      }

      setBags((prev) => {
        const { [key]: _, ...bags } = prev;
        return bags;
      });

      return true;
    },
    [active, bags]
  );

  const value: LuckyBagProviderContext = {
    bags,
    bag,
    openBag,
    getBag,
    addBag,
    deleteBag,
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useLuckyBags() {
  return useContext(Context);
}
