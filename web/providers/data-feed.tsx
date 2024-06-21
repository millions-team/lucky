'use client';

import React, { useEffect } from 'react';
import {
  OCR2Feed,
  Round,
  CHAINLINK_AGGREGATOR_PROGRAM_ID,
} from '@chainlink/solana-sdk';
import { useAnchorProvider } from '@/providers/solana-provider';
import { PublicKey } from '@solana/web3.js';

//SOL/USD Devnet Feed
const USD_SOL_FEED_ADDRESS = new PublicKey(
  '99B2bTijsU6f1GCT73HmdR7HCFFjGMBcPZY6jZ96ynrR'
);
export const DECIMALS = 8; // All Chainlink feeds have 8 decimals

// TODO: Implement as an stored atom to be used in localhost
const DataFeedContext = React.createContext<Round | null>(null);
export const useDataFeed = () => React.useContext(DataFeedContext) as Round;
export const DataFeedProvider: React.FC<
  React.PropsWithChildren<{ feedAddress?: PublicKey }>
> = ({ feedAddress = USD_SOL_FEED_ADDRESS, children }) => {
  const provider = useAnchorProvider();
  const [dataFeed, setDataFeed] = React.useState<OCR2Feed | null>(null);
  const [round, setRound] = React.useState<Round | null>(null);
  const [tick, setTick] = React.useState(0);

  useEffect(() => {
    if (dataFeed) return;

    const timeout = setTimeout(async () => {
      const feed = await OCR2Feed.load(
        CHAINLINK_AGGREGATOR_PROGRAM_ID,
        provider
      );
      setDataFeed(feed);
      setInterval(() => setTick((tick) => tick + 1), 30000);
    }, 300);

    return () => clearTimeout(timeout);
  }, [provider]);

  useEffect(() => {
    if (!dataFeed) return;

    const timeout = setTimeout(async () => {
      let listener: number;
      const setAndRemove = (round: Round) => {
        setRound(round);
        return dataFeed.removeListener(listener);
      };
      listener = dataFeed.onRound(feedAddress, setAndRemove);
    }, 100);

    return () => clearTimeout(timeout);
  }, [dataFeed, feedAddress, tick]);

  return (
    <DataFeedContext.Provider value={round}>
      {children}
    </DataFeedContext.Provider>
  );
};
