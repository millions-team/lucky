'use client';

import React, { useEffect } from 'react';
import {
  OCR2Feed,
  Round,
  CHAINLINK_AGGREGATOR_PROGRAM_ID,
} from '@chainlink/solana-sdk';
import { useAnchorProvider } from '@/providers/solana-provider';
import { PublicKey } from '@solana/web3.js';
import { atomWithStorage } from 'jotai/utils';
import { atom, useAtomValue, useSetAtom } from 'jotai/index';

//SOL/USD Devnet Feed
const USD_SOL_FEED_ADDRESS = new PublicKey(
  '99B2bTijsU6f1GCT73HmdR7HCFFjGMBcPZY6jZ96ynrR'
);
export const DECIMALS = 8; // All Chainlink feeds have 8 decimals
type StoredRound = Omit<Round, 'answer'> & { answer: number };
type Feeds = Record<string, StoredRound>;
const feedsAtom = atomWithStorage<Feeds>('feeds', {}, undefined, {
  getOnInit: true,
});
const lastFeedsAtom = atom<Feeds>((get) => get(feedsAtom));

const DataFeedContext = React.createContext<StoredRound | null>(null);
export const useDataFeed = () =>
  React.useContext(DataFeedContext) as StoredRound;
export const DataFeedProvider: React.FC<
  React.PropsWithChildren<{ feedAddress?: PublicKey }>
> = ({ feedAddress = USD_SOL_FEED_ADDRESS, children }) => {
  const feeds = useAtomValue(lastFeedsAtom);
  const setFeeds = useSetAtom(feedsAtom);

  const provider = useAnchorProvider();
  const [dataFeed, setDataFeed] = React.useState<OCR2Feed | null>(null);
  const [tick, setTick] = React.useState(0);

  useEffect(() => {
    if (dataFeed) return;

    const timeout = setTimeout(async () => {
      try {
        const feed = await OCR2Feed.load(
          CHAINLINK_AGGREGATOR_PROGRAM_ID,
          provider
        );
        setDataFeed(feed);
        setInterval(() => setTick((tick) => tick + 1), 30000);
      } catch (e) {
        console.error(e);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [provider]);

  useEffect(() => {
    if (!dataFeed) return;
    let listener: number;

    const timeout = setTimeout(async () => {
      const setAndRemove = ({ answer, ...rest }: Round) => {
        const round = { ...rest, answer: answer.toNumber() } as StoredRound;
        setFeeds((feeds) => ({
          ...feeds,
          [feedAddress.toString()]: round,
        }));
        return dataFeed.removeListener(listener);
      };
      listener = dataFeed.onRound(feedAddress, setAndRemove);
    }, 100);

    return () => clearTimeout(timeout);
  }, [dataFeed, feedAddress, tick]);

  return (
    <DataFeedContext.Provider value={feeds[feedAddress.toString()]}>
      {children}
    </DataFeedContext.Provider>
  );
};
